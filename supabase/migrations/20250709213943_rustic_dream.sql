/*
  # Create admin_user_overview view for user management

  1. New Views
    - `admin_user_overview`
      - Combines data from auth.users, profiles, stripe tables, and activity logs
      - Provides comprehensive user information for admin dashboard
      - Includes subscription status, order history, and activity tracking

  2. Security
    - View is accessible to authenticated users
    - RLS policies on underlying tables control actual access
    - Admin-only access enforced through application logic and edge functions
*/

-- Drop existing view if it exists to avoid conflicts
DROP VIEW IF EXISTS public.admin_user_overview;

-- Create the comprehensive admin user overview view
CREATE VIEW public.admin_user_overview AS
SELECT
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at,
    COALESCE(p.is_admin, false) as is_admin,
    COALESCE(p.is_banned, false) as is_banned,
    p.display_name,
    p.avatar_url,
    p.last_activity,
    p.updated_at as profile_updated_at,
    -- Determine subscription status based on active subscriptions
    CASE
        WHEN ss.status = 'active' THEN 'active'
        WHEN ss.status = 'canceled' THEN 'canceled'
        WHEN ss.status = 'past_due' THEN 'past_due'
        WHEN ss.status = 'trialing' THEN 'trialing'
        WHEN ss.status = 'incomplete' THEN 'incomplete'
        WHEN ss.status = 'incomplete_expired' THEN 'incomplete_expired'
        WHEN ss.status = 'unpaid' THEN 'unpaid'
        WHEN ss.status = 'paused' THEN 'paused'
        ELSE 'not_started'
    END AS subscription_status,
    ss.price_id,
    ss.current_period_end,
    ss.cancel_at_period_end,
    -- Aggregate order data
    COALESCE(order_stats.total_orders, 0)::integer AS total_orders,
    COALESCE(order_stats.total_spent, 0)::integer AS total_spent,
    -- Activity tracking
    COALESCE(activity_stats.login_count, 0)::integer AS login_count,
    activity_stats.last_login_ip,
    activity_stats.last_user_agent
FROM
    auth.users au
LEFT JOIN
    public.profiles p ON au.id = p.user_id
LEFT JOIN
    public.stripe_customers sc ON au.id = sc.user_id AND sc.deleted_at IS NULL
LEFT JOIN
    public.stripe_subscriptions ss ON sc.customer_id = ss.customer_id AND ss.deleted_at IS NULL
LEFT JOIN (
    -- Aggregate order statistics
    SELECT 
        so.customer_id,
        COUNT(so.id) as total_orders,
        SUM(so.amount_total) as total_spent
    FROM public.stripe_orders so
    WHERE so.payment_status = 'paid' AND so.deleted_at IS NULL
    GROUP BY so.customer_id
) order_stats ON sc.customer_id = order_stats.customer_id
LEFT JOIN (
    -- Aggregate activity statistics from user_activity_log
    SELECT 
        ual.user_id,
        COUNT(CASE WHEN ual.action = 'login' THEN 1 END) as login_count,
        (
            SELECT ip_address 
            FROM public.user_activity_log ual2 
            WHERE ual2.user_id = ual.user_id 
            AND ual2.action = 'login' 
            AND ual2.ip_address IS NOT NULL
            ORDER BY ual2.created_at DESC 
            LIMIT 1
        ) as last_login_ip,
        (
            SELECT user_agent 
            FROM public.user_activity_log ual3 
            WHERE ual3.user_id = ual.user_id 
            AND ual3.action = 'login' 
            AND ual3.user_agent IS NOT NULL
            ORDER BY ual3.created_at DESC 
            LIMIT 1
        ) as last_user_agent
    FROM public.user_activity_log ual
    GROUP BY ual.user_id
) activity_stats ON au.id = activity_stats.user_id
WHERE au.deleted_at IS NULL;

-- Grant select permission to authenticated users
GRANT SELECT ON public.admin_user_overview TO authenticated;

-- Add comment to the view
COMMENT ON VIEW public.admin_user_overview IS 'Comprehensive user data view for admin dashboard - combines auth, profile, subscription, and activity data. Access restricted to admins via function security.';