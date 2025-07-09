/*
  # Fix RLS Policy Infinite Recursion

  1. Problem
    - RLS policies on profiles table were causing infinite recursion
    - Policies checking admin status were querying profiles table from within profile operations
    - This created circular dependencies causing 500 errors

  2. Solution
    - Create security definer function to check admin status without RLS
    - Drop and recreate all problematic policies
    - Use the security definer function to break circular dependencies

  3. Changes
    - New is_admin() function bypasses RLS for admin checks
    - Simplified profile policies without recursion
    - Updated tool policies to use security definer function
    - Updated activity log policies to use security definer function
*/

-- Create a security definer function to check admin status without RLS
CREATE OR REPLACE FUNCTION is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE user_id = user_uuid LIMIT 1),
    false
  );
$$;

-- Drop ALL existing policies on tools table to avoid conflicts
DROP POLICY IF EXISTS "Public users can view public tools" ON tools;
DROP POLICY IF EXISTS "Admins can delete custom tools" ON tools;
DROP POLICY IF EXISTS "Admins can insert tools" ON tools;
DROP POLICY IF EXISTS "Admins can update tools" ON tools;
DROP POLICY IF EXISTS "Admins can view all tools" ON tools;

-- Drop ALL existing policies on profiles table to avoid conflicts
DROP POLICY IF EXISTS "Basic profile access" ON profiles;
DROP POLICY IF EXISTS "Basic profile update" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user profiles" ON profiles;

-- Drop existing policies on activity logs
DROP POLICY IF EXISTS "Admins can view all tool usage" ON tool_usage_log;
DROP POLICY IF EXISTS "Admins can view all activity" ON user_activity_log;

-- Create new simplified policies for profiles table (no recursion)
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create new non-recursive policies for tools table
CREATE POLICY "Public users can view public tools"
  ON tools
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

CREATE POLICY "Admins can view all tools"
  ON tools
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert tools"
  ON tools
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tools"
  ON tools
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete custom tools"
  ON tools
  FOR DELETE
  TO authenticated
  USING (is_custom = true AND is_admin(auth.uid()));

-- Update tool_usage_log policies to use the security definer function
CREATE POLICY "Admins can view all tool usage"
  ON tool_usage_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Update user_activity_log policies to use the security definer function  
CREATE POLICY "Admins can view all activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(uuid) TO authenticated;