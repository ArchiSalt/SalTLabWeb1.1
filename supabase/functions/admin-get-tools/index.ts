import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  status: 'development' | 'testing' | 'ready' | 'live';
  is_public: boolean;
  category: 'planning' | 'analysis' | 'estimation' | 'design';
  version: string;
  usage_count: number;
  is_custom: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ToolStats {
  total: number;
  live: number;
  development: number;
  testing: number;
  ready: number;
  custom: number;
  public: number;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
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

    // Verify the user's JWT token using the service role client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if user is admin using the service role client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!profile?.is_admin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch all tools using admin client
    const { data: tools, error: toolsError } = await supabaseAdmin
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (toolsError) {
      console.error('Error fetching tools:', toolsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch tools' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Calculate statistics
    const stats: ToolStats = {
      total: tools?.length || 0,
      live: tools?.filter(t => t.status === 'live').length || 0,
      development: tools?.filter(t => t.status === 'development').length || 0,
      testing: tools?.filter(t => t.status === 'testing').length || 0,
      ready: tools?.filter(t => t.status === 'ready').length || 0,
      custom: tools?.filter(t => t.is_custom).length || 0,
      public: tools?.filter(t => t.is_public).length || 0,
    };

    return new Response(
      JSON.stringify({
        tools: tools || [],
        stats,
        success: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Admin get tools error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});