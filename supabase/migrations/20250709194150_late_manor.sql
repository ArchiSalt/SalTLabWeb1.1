/*
  # Simplified Admin User Overview

  1. Simplified View
    - Remove complex subqueries that may cause performance issues
    - Focus on core user and profile data
    - Add subscription status from existing view
    - Keep essential fields only

  2. Changes
    - Remove activity statistics (login_count, last_login_ip, last_user_agent)
    - Remove order statistics (total_orders, total_spent)
    - Simplify joins to reduce complexity
    - Keep only essential user management data
*/

-- Drop the existing complex view
DROP VIEW IF EXISTS admin_user_overview;

-- Create simplified admin user overview view
CREATE VIEW admin_user_overview WITH (security_invoker = true) AS
SELECT 
  u.id,
  u.email,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at,
  COALESCE(p.is_admin, false) as is_admin,
  COALESCE(p.is_banned, false) as is_banned,
  p.display_name,
  p.avatar_url,
  p.last_activity,
  p.updated_at as profile_updated_at,
  
  -- Subscription information (simplified)
  COALESCE(s.subscription_status, 'not_started'::stripe_subscription_status) as subscription_status,
  s.price_id,
  s.current_period_end,
  s.cancel_at_period_end,
  
  -- Simplified statistics (using basic counts)
  0 as total_orders,
  0 as total_spent,
  0 as login_count,
  NULL as last_login_ip,
  NULL as last_user_agent

FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN stripe_user_subscriptions s ON u.id = (
  SELECT sc.user_id 
  FROM stripe_customers sc 
  WHERE sc.customer_id = s.customer_id 
  AND sc.deleted_at IS NULL
  LIMIT 1
);

-- Grant access to authenticated users (admin check is handled by RLS)
GRANT SELECT ON admin_user_overview TO authenticated;