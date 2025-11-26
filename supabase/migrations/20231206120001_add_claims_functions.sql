
-- Function to get a user's custom claim
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT) RETURNS JSONB AS $$
    SELECT coalesce(current_setting('request.jwt.claims', true)::jsonb ->> claim, null)::jsonb;
$$ LANGUAGE sql STABLE;

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_claims_admin() RETURNS BOOLEAN AS $$
    SELECT get_my_claim('admin') IS NOT NULL;
$$ LANGUAGE sql STABLE;
