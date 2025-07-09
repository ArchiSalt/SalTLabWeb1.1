import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface UpdateUserRequest {
  userId: string;
  action: 'ban' | 'unban' | 'make_admin' | 'remove_admin' | 'delete';
  reason?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the requesting user's JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the user is authenticated and is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { userId, action, reason }: UpdateUserRequest = await req.json();

    if (!userId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prevent admin from modifying their own admin status
    if (userId === user.id && (action === 'remove_admin' || action === 'delete')) {
      return new Response(
        JSON.stringify({ error: 'Cannot modify your own admin status or delete your own account' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result;
    let logAction = action;
    let logDetails: any = { target_user_id: userId, reason };

    switch (action) {
      case 'ban':
        result = await supabaseAdmin
          .from('profiles')
          .update({ is_banned: true })
          .eq('user_id', userId);
        break;

      case 'unban':
        result = await supabaseAdmin
          .from('profiles')
          .update({ is_banned: false })
          .eq('user_id', userId);
        break;

      case 'make_admin':
        result = await supabaseAdmin
          .from('profiles')
          .update({ is_admin: true })
          .eq('user_id', userId);
        break;

      case 'remove_admin':
        result = await supabaseAdmin
          .from('profiles')
          .update({ is_admin: false })
          .eq('user_id', userId);
        break;

      case 'delete':
        // First delete the user from auth (this will cascade to profiles due to foreign key)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) {
          throw deleteError;
        }
        result = { error: null };
        logAction = 'delete_user';
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    if (result.error) {
      console.error('Database operation error:', result.error);
      return new Response(
        JSON.stringify({ error: 'Failed to update user' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log the admin action
    await supabaseAdmin
      .from('user_activity_log')
      .insert({
        user_id: user.id,
        action: `admin_${logAction}`,
        details: logDetails,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${action} completed successfully`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Admin update user error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});