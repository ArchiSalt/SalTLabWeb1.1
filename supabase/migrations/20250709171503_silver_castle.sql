/*
  # Tools Management Schema

  1. New Tables
    - `tools`: Stores all tool information
      - `id` (uuid, primary key)
      - `name` (text, tool display name)
      - `description` (text, tool description)
      - `icon` (text, lucide icon name)
      - `route` (text, URL route)
      - `status` (enum: development, testing, ready, live)
      - `is_public` (boolean, whether tool is publicly visible)
      - `category` (enum: planning, analysis, estimation, design)
      - `version` (text, semantic version)
      - `usage_count` (bigint, number of times used)
      - `is_custom` (boolean, whether tool was added by admin)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on tools table
    - Public users can view public tools only
    - Admin users can view and manage all tools
    - Track tool usage statistics
*/

-- Create enum types for tools
CREATE TYPE tool_status AS ENUM (
    'development',
    'testing',
    'ready',
    'live'
);

CREATE TYPE tool_category AS ENUM (
    'planning',
    'analysis',
    'estimation',
    'design'
);

-- Create tools table
CREATE TABLE IF NOT EXISTS tools (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL DEFAULT 'Wrench',
    route text NOT NULL UNIQUE,
    status tool_status NOT NULL DEFAULT 'development',
    is_public boolean NOT NULL DEFAULT false,
    category tool_category NOT NULL,
    version text NOT NULL DEFAULT '1.0.0',
    usage_count bigint NOT NULL DEFAULT 0,
    is_custom boolean NOT NULL DEFAULT true,
    created_by uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public users can view public tools"
    ON tools
    FOR SELECT
    TO authenticated, anon
    USING (is_public = true);

CREATE POLICY "Admins can view all tools"
    ON tools
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can insert tools"
    ON tools
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can update tools"
    ON tools
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Admins can delete custom tools"
    ON tools
    FOR DELETE
    TO authenticated
    USING (
        is_custom = true AND
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_tool_updated()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update timestamp
CREATE TRIGGER on_tool_updated
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION handle_tool_updated();

-- Insert default tools (existing tools from the application)
INSERT INTO tools (name, description, icon, route, status, is_public, category, version, is_custom, created_by) VALUES
('Style Match', 'Upload a reference image and get architectural style suggestions and recommendations.', 'Camera', '/style-match', 'live', true, 'design', '1.2.0', false, NULL),
('Site Planner', 'Draw and zone your property or concept site visually with intuitive planning tools.', 'MapPin', '/site-planner', 'live', true, 'planning', '1.1.0', false, NULL),
('Plan Generator', 'Automatically generate basic building plans tailored to your specifications.', 'FileText', '/plan-generator', 'live', true, 'planning', '1.0.5', false, NULL),
('Codebot', 'Quickly check building code requirements and zoning limits for your area.', 'Bot', '/codebot', 'live', true, 'analysis', '1.3.0', false, NULL),
('Estimated Cost', 'Visual material-based cost estimations using industry presets and current pricing.', 'Calculator', '/estimated-cost', 'live', true, 'estimation', '1.1.2', false, NULL)
ON CONFLICT (route) DO NOTHING;

-- Create tool usage tracking table
CREATE TABLE IF NOT EXISTS tool_usage_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id uuid REFERENCES tools(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id text,
    ip_address text,
    user_agent text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on tool usage log
ALTER TABLE tool_usage_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for tool usage log
CREATE POLICY "Admins can view all tool usage"
    ON tool_usage_log
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "System can insert tool usage"
    ON tool_usage_log
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);

-- Function to increment tool usage count
CREATE OR REPLACE FUNCTION increment_tool_usage(tool_route text)
RETURNS void AS $$
BEGIN
    UPDATE tools 
    SET usage_count = usage_count + 1 
    WHERE route = tool_route;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION increment_tool_usage(text) TO authenticated, anon;