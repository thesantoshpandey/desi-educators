-- Fix for "Function public.handle_new_user has a role mutable search_path"
-- This ensures the function runs with a secure search path, preventing potential security vulnerabilities.

ALTER FUNCTION public.handle_new_user() SET search_path = public;
