
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { OAUTH_CONFIG } from '@/lib/oauth_config';

export async function POST(req: NextRequest) {
    try {
        const { code, provider } = await req.json();

        if (!code || !provider) {
            return NextResponse.json({ error: 'Missing code or provider' }, { status: 400 });
        }

        if (!OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]) {
            return NextResponse.json({ error: 'Invalid provider configuration' }, { status: 400 });
        }

        const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
        // The redirect URI sent in the exchange request MUST match the one used during the initial auth redirect
        // Since we are now using a client-side callback page, the redirect URI is that page's URL.
        const origin = new URL(req.url).origin;
        // e.g. https://domain.com/integrations/callback
        const redirectUri = `${origin}/integrations/callback`;

        // 1. Get current user
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Exchange code for token
        const tokenParams = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        // Special handling for Basic Auth if needed (some providers prefer it), but most like body params.
        // Slack uses body params. Google uses body params.

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                ...(provider === 'slack' || provider === 'github' ? { 'Accept': 'application/json' } : {})
            },
            body: tokenParams.toString()
        });

        const tokens = await response.json();

        if (!response.ok || tokens.error) {
            console.error("Token Exchange Error:", tokens);
            throw new Error(tokens.error_description || tokens.error || `Failed to exchange token with ${provider}`);
        }

        // 3. Normalized Token Data
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
            }, { onConflict: 'user_id, provider' });

        if (dbError) {
            console.error("Database upsert error:", dbError);
            throw new Error(`Database error: ${dbError.message}`);
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error("Exchange API Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
