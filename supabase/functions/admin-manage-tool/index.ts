import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface ToolData {
  id?: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  status: 'development' | 'testing' | 'ready' | 'live';
  is_public: boolean;
  category: 'planning' | 'analysis' | 'estimation' | 'design';
  version: string;
}

interface ManageToolRequest {
  action: 'add' | 'update' | 'delete' | 'toggle_public' | 'promote_status';
  tool?: ToolData;
  toolId?: string;
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
    const { action, tool, toolId }: ManageToolRequest = await req.json();

    if (!action) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: action' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let result;
    let message = '';

    switch (action) {
      case 'add':
        if (!tool) {
          return new Response(
            JSON.stringify({ error: 'Missing tool data for add action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Validate route uniqueness
        const { data: existingTool } = await supabaseAdmin
          .from('tools')
          .select('id')
          .eq('route', tool.route)
          .single();

        if (existingTool) {
          return new Response(
            JSON.stringify({ error: 'A tool with this route already exists' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        result = await supabaseAdmin
          .from('tools')
          .insert({
            ...tool,
            is_custom: true,
            created_by: user.id,
          })
          .select()
          .single();

        message = 'Tool created successfully';
        break;

      case 'update':
        if (!tool || !tool.id) {
          return new Response(
            JSON.stringify({ error: 'Missing tool data or ID for update action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Check if route is unique (excluding current tool)
        const { data: conflictingTool } = await supabaseAdmin
          .from('tools')
          .select('id')
          .eq('route', tool.route)
          .neq('id', tool.id)
          .single();

        if (conflictingTool) {
          return new Response(
            JSON.stringify({ error: 'A tool with this route already exists' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        result = await supabaseAdmin
          .from('tools')
          .update({
            name: tool.name,
            description: tool.description,
            icon: tool.icon,
            route: tool.route,
            status: tool.status,
            is_public: tool.is_public,
            category: tool.category,
            version: tool.version,
          })
          .eq('id', tool.id)
          .select()
          .single();

        message = 'Tool updated successfully';
        break;

      case 'delete':
        if (!toolId) {
          return new Response(
            JSON.stringify({ error: 'Missing toolId for delete action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Only allow deletion of custom tools
        result = await supabaseAdmin
          .from('tools')
          .delete()
          .eq('id', toolId)
          .eq('is_custom', true)
          .select()
          .single();

        if (!result.data) {
          return new Response(
            JSON.stringify({ error: 'Tool not found or cannot be deleted (only custom tools can be deleted)' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        message = 'Tool deleted successfully';
        break;

      case 'toggle_public':
        if (!toolId) {
          return new Response(
            JSON.stringify({ error: 'Missing toolId for toggle_public action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Get current tool to toggle its public status
        const { data: currentTool, error: getCurrentError } = await supabaseAdmin
          .from('tools')
          .select('is_public')
          .eq('id', toolId)
          .single();

        if (getCurrentError || !currentTool) {
          return new Response(
            JSON.stringify({ error: 'Tool not found' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        result = await supabaseAdmin
          .from('tools')
          .update({ is_public: !currentTool.is_public })
          .eq('id', toolId)
          .select()
          .single();

        message = `Tool ${!currentTool.is_public ? 'published' : 'unpublished'} successfully`;
        break;

      case 'promote_status':
        if (!toolId) {
          return new Response(
            JSON.stringify({ error: 'Missing toolId for promote_status action' }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        // Get current tool to promote its status
        const { data: toolToPromote, error: getPromoteError } = await supabaseAdmin
          .from('tools')
          .select('status')
          .eq('id', toolId)
          .single();

        if (getPromoteError || !toolToPromote) {
          return new Response(
            JSON.stringify({ error: 'Tool not found' }),
            {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        let newStatus = toolToPromote.status;
        switch (toolToPromote.status) {
          case 'development':
            newStatus = 'testing';
            break;
          case 'testing':
            newStatus = 'ready';
            break;
          case 'ready':
            newStatus = 'live';
            break;
          default:
            return new Response(
              JSON.stringify({ error: 'Tool is already at the highest status level' }),
              {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              }
            );
        }

        result = await supabaseAdmin
          .from('tools')
          .update({ status: newStatus })
          .eq('id', toolId)
          .select()
          .single();

        message = `Tool status promoted to ${newStatus}`;
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
        JSON.stringify({ error: 'Database operation failed' }),
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
        action: `admin_tool_${action}`,
        details: {
          tool_id: result.data?.id || toolId,
          tool_name: result.data?.name || tool?.name,
          action,
        },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
      });

    return new Response(
      JSON.stringify({
        success: true,
        message,
        tool: result.data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Admin manage tool error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});