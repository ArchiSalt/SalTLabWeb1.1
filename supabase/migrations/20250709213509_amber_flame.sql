/*
  # Create admin user overview function and view

  1. Security
    - Creates security definer function to safely access auth.users
    - Function includes admin check to restrict access
    - Only admins can execute the function

  2. Data Access
    - Combines user data from auth.users, profiles, subscriptions, and activity logs
    - Provides comprehensive user information for admin dashboard
    - Handles missing data with appropriate defaults
*/

-- Drop existing view and function if they exist to avoid conflicts
DROP VIEW IF EXISTS public.admin_user_overview;
DROP FUNCTION IF EXISTS get_admin_user_overview();

-- Create a security definer function to access auth.users safely with admin check
CREATE OR REPLACE FUNCTION get_admin_user_overview()
RETURNS TABLE (
    id uuid,
    email character varying,
    created_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    email_confirmed_at timestamp with time zone,
    is_admin boolean,
    is_banned boolean,
    display_name text,
    avatar_url text,
    last_activity timestamp with time zone,
    profile_updated_at timestamp with time zone,
    subscription_status text,
    price_id text,
    current_period_end bigint,
    cancel_at_period_end boolean,
    total_orders integer,
    total_spent integer,
    login_count integer,
    last_login_ip text,
    last_user_agent text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if the current user is an admin
    IF NOT is_admin(uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.email::character varying,
        u.created_at,
        u.last_sign_in_at,
        u.email_confirmed_at,
        COALESCE(p.is_admin, false) as is_admin,
        COALESCE(p.is_banned, false) as is_banned,
        p.display_name,
        p.avatar_url,
        p.last_activity,
        p.updated_at as profile_updated_at,
        COALESCE(
            (SELECT s.status::text FROM public.stripe_subscriptions s
             JOIN public.stripe_customers sc ON s.customer_id = sc.customer_id
             WHERE sc.user_id = u.id AND s.deleted_at IS NULL
             ORDER BY s.current_period_end DESC
             LIMIT 1),
            'not_started'
        ) AS subscription_status,
        (SELECT s.price_id FROM public.stripe_subscriptions s
         JOIN public.stripe_customers sc ON s.customer_id = sc.customer_id
         WHERE sc.user_id = u.id AND s.deleted_at IS NULL
         ORDER BY s.current_period_end DESC
         LIMIT 1) AS price_id,
        (SELECT s.current_period_end FROM public.stripe_subscriptions s
         JOIN public.stripe_customers sc ON s.customer_id = sc.customer_id
         WHERE sc.user_id = u.id AND s.deleted_at IS NULL
         ORDER BY s.current_period_end DESC
         LIMIT 1) AS current_period_end,
        (SELECT s.cancel_at_period_end FROM public.stripe_subscriptions s
         JOIN public.stripe_customers sc ON s.customer_id = sc.customer_id
         WHERE sc.user_id = u.id AND s.deleted_at IS NULL
         ORDER BY s.current_period_end DESC
         LIMIT 1) AS cancel_at_period_end,
        COALESCE(
            (SELECT COUNT(*)::integer FROM public.stripe_orders so
             JOIN public.stripe_customers sc ON so.customer_id = sc.customer_id
             WHERE sc.user_id = u.id AND so.status = 'completed' AND so.deleted_at IS NULL),
            0
        ) AS total_orders,
        COALESCE(
            (SELECT SUM(so.amount_total)::integer FROM public.stripe_orders so
             JOIN public.stripe_customers sc ON so.customer_id = sc.customer_id
             WHERE sc.user_id = u.id AND so.status = 'completed' AND so.deleted_at IS NULL),
            0
        ) AS total_spent,
        COALESCE(
            (SELECT COUNT(*)::integer FROM public.user_activity_log ual 
             WHERE ual.user_id = u.id AND ual.action = 'login'),
            0
        ) AS login_count,
        (SELECT ual.ip_address FROM public.user_activity_log ual 
         WHERE ual.user_id = u.id AND ual.action = 'login' 
         ORDER BY ual.created_at DESC 
         LIMIT 1) AS last_login_ip,
        (SELECT ual.user_agent FROM public.user_activity_log ual 
         WHERE ual.user_id = u.id AND ual.action = 'login' 
         ORDER BY ual.created_at DESC 
         LIMIT 1) AS last_user_agent
    FROM
        auth.users u
    LEFT JOIN
        public.profiles p ON u.id = p.user_id
    WHERE
        u.deleted_at IS NULL;
END;
$$;

-- Create the view using the security definer function
CREATE VIEW public.admin_user_overview AS
SELECT * FROM get_admin_user_overview();

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_user_overview() TO authenticated;

-- Grant select permission on the view to authenticated users
GRANT SELECT ON public.admin_user_overview TO authenticated;

-- Add helpful comments
COMMENT ON VIEW public.admin_user_overview IS 'Comprehensive user data view for admin dashboard - combines auth, profile, subscription, and activity data. Access restricted to admins via function security.';
COMMENT ON FUNCTION get_admin_user_overview() IS 'Security definer function to safely access auth.users data for admin user overview. Includes admin privilege check.';