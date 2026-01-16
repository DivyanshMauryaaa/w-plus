
export const OAUTH_CONFIG = {
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send',
    },
    slack: {
        clientId: process.env.SLACK_CLIENT_ID!,
        clientSecret: process.env.SLACK_CLIENT_SECRET!,
        authUrl: 'https://slack.com/oauth/v2/authorize',
        tokenUrl: 'https://slack.com/api/oauth.v2.access',
        scope: 'chat:write,channels:read,users:read', // Bot scopes
    },
    notion: {
        clientId: process.env.NOTION_CLIENT_ID!,
        clientSecret: process.env.NOTION_CLIENT_SECRET!,
        authUrl: 'https://api.notion.com/v1/oauth/authorize',
        tokenUrl: 'https://api.notion.com/v1/oauth/token',
        scope: '',
    },
    x: {
        clientId: process.env.X_CLIENT_ID!,
        clientSecret: process.env.X_CLIENT_SECRET!,
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        scope: 'tweet.read tweet.write users.read offline.access',
    },
    instagram: {
        clientId: process.env.INSTAGRAM_CLIENT_ID!,
        clientSecret: process.env.INSTAGRAM_CLIENT_SECRET!,
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
        scope: 'user_profile,user_media',
    },
    linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID!,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'w_member_social r_liteprofile',
    },
    github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        authUrl: 'https://github.com/login/oauth/authorize',
        tokenUrl: 'https://github.com/login/oauth/access_token',
        scope: 'repo user',
    },
    youtube: {
        // Uses Google Config but might need different scope if we want to separate it. 
        // For simplicity, we can treat it as 'google' provider but with more scopes, 
        // OR separate provider 'youtube' that uses same clientId.
        // Let's use 'google' config for authUrl but extra scope.
        // Actually, cleaner to separate 'youtube' provider logic if we want a distinct button?
        // Or better: Just add Youtube scopes to the main Google config?
        // The user asked for "Youtube", implying a separate button.
        // If I use 'youtube' as provider key, I can reuse Google keys in ENV.
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    }
};

export const getRedirectUri = (provider: string, origin: string) => {
    // Return client-side callback page
    return `${origin}/integrations/callback`;
};
