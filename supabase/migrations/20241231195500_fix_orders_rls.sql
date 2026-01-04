-- Fix orders RLS policies to ensure admins can see all orders
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Ensure the has_role function works correctly
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role::app_role
  )
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated, anon;

-- Create a simpler policy for admins to see all orders
CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Add a function to check all orders for debugging
CREATE OR REPLACE FUNCTION debug_orders()
RETURNS TABLE(
  id UUID,
  order_number TEXT,
  user_id UUID,
  total DECIMAL,
  status TEXT,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  auth_user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.user_id,
    o.total,
    o.status,
    o.customer_name,
    o.created_at,
    auth.uid() as auth_user_id
  FROM public.orders o
  ORDER BY o.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION debug_orders TO authenticated;
