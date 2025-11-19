-- Create API tokens table for external integrations
CREATE TABLE public.api_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  token_hash text NOT NULL UNIQUE,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view their own API tokens"
ON public.api_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own tokens
CREATE POLICY "Users can create their own API tokens"
ON public.api_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens (revoke)
CREATE POLICY "Users can update their own API tokens"
ON public.api_tokens
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete their own API tokens"
ON public.api_tokens
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster token lookups
CREATE INDEX idx_api_tokens_hash ON public.api_tokens(token_hash);
CREATE INDEX idx_api_tokens_user_id ON public.api_tokens(user_id);