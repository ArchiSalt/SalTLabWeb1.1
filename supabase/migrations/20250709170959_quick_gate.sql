/*
  # User Profiles and Admin Management Schema

  1. New Tables
    - `profiles`: Extended user information and roles
      - `user_id` (uuid, references auth.users)
      - `is_admin` (boolean, default false)
      - `is_banned` (boolean, default false)
      - `display_name` (text, optional)
      - `avatar_url` (text, optional)
      - `last_activity` (timestamp)
      - `created_at` and `updated_at` timestamps

    - `user_activity_log`: Track user actions for admin monitoring
      - `user_id` (uuid, references auth.users)
      - `action` (text, e.g., 'login', 'tool_usage', 'admin_action')
      - `details` (jsonb, flexible data storage)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. Views
    - `admin_user_overview`: Comprehensive user data for admin dashboard
      - Combines auth.users, profiles, subscription data, and activity

  3. Security
    - Enable RLS on all tables
    - Admin-only policies for user management operations
    - User policies for own profile access
*/

-- Create profiles table for extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  is_admin boolean DEFAULT false NOT NULL,
  is_banned boolean DEFAULT false NOT NULL,
  display_name text,
  avatar_url text,
  last_activity timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
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
  WITH CHECK (user_id = auth.uid() AND is_admin = (SELECT is_admin FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update user profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Create user activity log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on user_activity_log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all activity"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "System can insert activity logs"
  ON user_activity_log
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create admin user overview view
CREATE VIEW admin_user_overview WITH (security_invoker = true) AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  p.is_admin,
  p.is_banned,
  p.display_name,
  p.avatar_url,
  p.last_activity,
  p.updated_at as profile_updated_at,
  
  -- Subscription information
  COALESCE(s.subscription_status, 'not_started'::stripe_subscription_status) as subscription_status,
  s.price_id,
  s.current_period_end,
  s.cancel_at_period_end,
  
  -- Order statistics
  COALESCE(order_stats.total_orders, 0) as total_orders,
  COALESCE(order_stats.total_spent, 0) as total_spent,
  
  -- Activity statistics
  COALESCE(activity_stats.login_count, 0) as login_count,
  activity_stats.last_login_ip,
  activity_stats.last_user_agent

FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN stripe_user_subscriptions s ON u.id = (
  SELECT sc.user_id FROM stripe_customers sc WHERE sc.customer_id = s.customer_id
)
LEFT JOIN (
  SELECT 
    sc.user_id,
    COUNT(o.id) as total_orders,
    SUM(o.amount_total) as total_spent
  FROM stripe_customers sc
  LEFT JOIN stripe_orders o ON sc.customer_id = o.customer_id AND o.deleted_at IS NULL
  WHERE sc.deleted_at IS NULL
  GROUP BY sc.user_id
) order_stats ON u.id = order_stats.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) FILTER (WHERE action = 'login') as login_count,
    (SELECT ip_address FROM user_activity_log ual2 WHERE ual2.user_id = ual.user_id AND action = 'login' ORDER BY created_at DESC LIMIT 1) as last_login_ip,
    (SELECT user_agent FROM user_activity_log ual3 WHERE ual3.user_id = ual.user_id AND action = 'login' ORDER BY created_at DESC LIMIT 1) as last_user_agent
  FROM user_activity_log ual
  GROUP BY user_id
) activity_stats ON u.id = activity_stats.user_id;

-- Grant access to admin users only
GRANT SELECT ON admin_user_overview TO authenticated;

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Log the signup activity
  INSERT INTO user_activity_log (user_id, action, details, ip_address)
  VALUES (
    NEW.id, 
    'signup', 
    jsonb_build_object('email', NEW.email, 'signup_method', 'email'),
    COALESCE(NEW.raw_user_meta_data->>'ip_address', 'unknown')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION handle_profile_updated()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update profile timestamp
DROP TRIGGER IF EXISTS on_profile_updated ON profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profile_updated();

-- Create initial admin user (replace with your email)
DO $$
BEGIN
  -- Only create if the user exists and doesn't already have a profile
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'srymniak@gmail.com') THEN
    INSERT INTO profiles (user_id, is_admin, display_name)
    SELECT id, true, 'Admin'
    FROM auth.users 
    WHERE email = 'srymniak@gmail.com'
    ON CONFLICT (user_id) DO UPDATE SET is_admin = true;
  END IF;
END $$;