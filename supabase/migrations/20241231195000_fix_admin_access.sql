-- Create admin user role assignment
-- First, let's create a function to assign admin role to a specific email
CREATE OR REPLACE FUNCTION assign_admin_role(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    -- If user exists, assign admin role
    IF target_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin')
        ON CONFLICT (user_id, role) DO NOTHING;
    END IF;
END;
$$;

-- Create a temporary function to check if orders table has data
CREATE OR REPLACE FUNCTION check_orders_data()
RETURNS TABLE(order_count BIGINT, sample_order JSON)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT,
        json_agg(row_to_json(orders.*))::JSON
    FROM public.orders
    LIMIT 1;
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION assign_admin_role TO authenticated;
GRANT EXECUTE ON FUNCTION check_orders_data TO authenticated;
