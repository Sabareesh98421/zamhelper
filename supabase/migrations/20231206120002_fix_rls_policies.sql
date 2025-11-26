
-- Drop the old, incorrect policy that caused the recursion
DROP POLICY IF EXISTS "Admins can view all profiles." ON profiles;

-- Re-create the policy using the claims function to avoid recursion
CREATE POLICY "Admins can view all profiles." ON profiles
    FOR SELECT USING (get_my_claim('admin') IS NOT NULL);

-- Also add the policy to allow users to update their own profiles, which was part of the original intent
CREATE POLICY "Users can update their own profile." ON profiles
    FOR UPDATE USING (auth.uid() = id);
