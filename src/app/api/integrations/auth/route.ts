
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { OAUTH_CONFIG, getRedirectUri } from '@/lib/oauth_config';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action'); // 'start' | 'callback'
    const provider = searchParams.get('provider');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (!provider || !OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]) {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    const origin = new URL(req.url).origin;
    const redirectUri = getRedirectUri(provider, origin);

    // 1. START FLOW
    if (action === 'start') {
        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: config.scope,
            access_type: 'offline', // For Google Refresh Token
            prompt: 'consent', // Force consent for Google to ensure refresh token
        });

        return NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
    }

    // 2. CALLBACK FLOW (When provider redirects back to us, but we defined redirect as this route with action=callback? No, redirect URI is fixed.)
    // Wait, the redirect URI in `oauth_config` is `/api/integrations/auth/callback`. So we need a separate file or handle the path.
    // Let's stick to using `src/app/api/integrations/auth/callback/route.ts` for cleaner separation.
    // But since I am writing this file, I'll allow this file to handle standard GET.
    // IF the provider redirects to `/api/integrations/auth/callback`, I need THAT file.
    // If I use query params logic here, the provider redirect URI must match EXACTLY.
    // Most providers don't like query params in the registered Redirect URI (except state).
    // So better to implement `/api/integrations/auth/callback/route.ts`.

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
