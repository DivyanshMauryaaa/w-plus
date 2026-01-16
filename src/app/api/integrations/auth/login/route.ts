
import { NextRequest, NextResponse } from 'next/server';
import { OAUTH_CONFIG, getRedirectUri } from '@/lib/oauth_config';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');

    if (!provider || !OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG]) {
        return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    const origin = new URL(req.url).origin;

    // We point the redirect_uri to our CLIENT-SIDE callback page
    // Ensure this matches what you register in Google/Slack console!
    // Example: https://your-domain.com/integrations/callback
    const redirectUri = `${origin}/integrations/callback`;

    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: config.scope,
        state: provider, // Use state to pass the provider name back
        access_type: 'offline', // For Google Refresh Token
        prompt: 'consent', // Force consent for Google to ensure refresh token
    });

    return NextResponse.redirect(`${config.authUrl}?${params.toString()}`);
}
