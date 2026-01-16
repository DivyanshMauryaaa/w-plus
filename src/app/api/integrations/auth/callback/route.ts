
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { OAUTH_CONFIG } from '@/lib/oauth_config';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Provider name passed as state
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: `OAuth Error: ${error}` }, { status: 400 });
    }

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or provider state' }, { status: 400 });
    }

    const provider = state;
    if (!OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]) {
        return NextResponse.json({ error: 'Invalid provider in state' }, { status: 400 });
    }

    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/integrations/auth/callback`;

    // 1. Get current user (Must be logged in)
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    try {
        // 2. Exchange code for token
        const tokenParams = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString()
        });

        const tokens = await response.json();

        if (!response.ok || tokens.error) {
            throw new Error(tokens.error_description || tokens.error || 'Failed to exchange token');
        }

        // 3. Normalized Token Data
        // Google returns: access_token, refresh_token, expires_in, scope
        // Slack returns: ok: true, access_token, bot_user_id, team, authed_user...

        let accessToken = tokens.access_token;
        let refreshToken = tokens.refresh_token;

        // Expiration calculation
        const expiresIn = tokens.expires_in; // Seconds
        const expiresAt = expiresIn ? Date.now() + (expiresIn * 1000) : null;

        // Upsert into Supabase
        const { error: dbError } = await supabase
            .from('connected_accounts')
            .upsert({
                user_id: user.id,
                provider,
                access_token: accessToken,
                refresh_token: refreshToken,
                expires_at: expiresAt,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, provider' }); // relies on unique constraint

        if (dbError) {
            throw new Error(`Database error: ${dbError.message}`);
        }

        // 4. Redirect back to frontend success page
        return NextResponse.redirect(`${origin}?success=true&provider=${provider}`);

    } catch (err: any) {
        console.error("OAuth Callback Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
