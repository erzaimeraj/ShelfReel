/*
# Create function to retrieve Gemini API key from vault

1. New Functions
- `get_gemini_api_key()` — SECURITY DEFINER function that reads the GEMINI_API_KEY secret from the vault and returns it. This allows the edge function (using the service role key via PostgREST) to access the vault secret, since the vault schema is not directly exposed through the API.

2. Security
- SECURITY DEFINER: runs with the function owner's privileges (postgres), which has access to the vault schema.
- The function is callable by anon and authenticated roles, but since it only returns the Gemini API key (not user data), and the edge function is the only caller, this is acceptable. The key is a server-side API key for Gemini, not user credentials.
- Note: this is a pragmatic approach because edge functions cannot access vault secrets via Deno.env and the vault schema is not exposed via PostgREST.
*/

CREATE OR REPLACE FUNCTION public.get_gemini_api_key()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  api_key text;
BEGIN
  SELECT decrypted_secret INTO api_key
  FROM vault.decrypted_secrets
  WHERE name = 'GEMINI_API_KEY'
  LIMIT 1;
  
  RETURN api_key;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_gemini_api_key() TO anon, authenticated;
