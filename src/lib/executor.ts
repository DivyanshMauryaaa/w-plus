
import { ActionType } from './integrations';
import { supabase } from './supabase';
import { OAUTH_CONFIG } from './oauth_config';

export interface ExecutionResult {
    success: boolean;
    output?: any;
    error?: string;
    logs?: string[];
}

/**
 * Retrieves the appropriate API token/key.
 * Priority: 
 * 1. Manually passed 'credentials' object (User's local storage or explicit override).
 * 2. Environment variables (Server defaults).
 * 3. Database 'connected_accounts' for the specific userId (OAuth).
 */
async function getToken(key: string, credentials?: Record<string, string>, userId?: string): Promise<string> {
    // 1. Manual/Local Credentials
    if (credentials && credentials[key]) {
        return credentials[key];
    }

    // 2. Environment Variables
    const envVal = process.env[key];
    if (envVal) return envVal;

    // 3. Database Retrieval (OAuth)
    if (userId) {
        // Map ENV KEY to Provider Name
        let provider: string | null = null;
        if (key === 'GOOGLE_ACCESS_TOKEN') provider = 'google';
        if (key === 'SLACK_BOT_TOKEN') provider = 'slack';
        if (key === 'SLACK_BOT_TOKEN') provider = 'slack';
        if (key === 'NOTION_API_KEY') provider = 'notion';
        if (key === 'JIRA_ACCESS_TOKEN') provider = 'jira';

        if (provider) {
            const { data, error } = await supabase
                .from('connected_accounts')
                .select('*')
                .eq('user_id', userId)
                .eq('provider', provider)
                .single();

            if (data) {
                // Check Expiration
                if (data.expires_at && Date.now() > data.expires_at) {
                    // Token expired, attempt refresh
                    // Note: This requires refresh_token
                    if (data.refresh_token) {
                        try {
                            const newToken = await refreshOAuthToken(provider, data.refresh_token);
                            // Update DB
                            await supabase.from('connected_accounts').update({
                                access_token: newToken.access_token,
                                refresh_token: newToken.refresh_token || data.refresh_token, // specific provs might rotate rt
                                expires_at: Date.now() + (newToken.expires_in * 1000),
                                updated_at: new Date().toISOString()
                            }).eq('id', data.id);

                            return newToken.access_token;
                        } catch (e) {
                            console.error(`Failed to refresh token for ${provider}`, e);
                            throw new Error(`Token for ${provider} expired and refresh failed.`);
                        }
                    } else {
                        throw new Error(`Token for ${provider} expired and no refresh token available. Please reconnect.`);
                    }
                }
                return data.access_token;
            }
        }
    }

    throw new Error(`Missing credential: ${key}. Please configure it in settings or environment variables.`);
}

async function refreshOAuthToken(provider: string, refreshToken: string) {
    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    if (!config) throw new Error("Unknown provider config for refresh");

    const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    });

    const res = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || data.error || 'Refresh failed');
    return data;
}

export async function executeAction(
    actionId: ActionType,
    config: any,
    credentials?: Record<string, string>,
    userId?: string
): Promise<ExecutionResult> {
    console.log(`Executing action: ${actionId} for user: ${userId || 'anon'}`, { ...config, headers: '***', token: '***' });

    try {
        switch (actionId) {
            // --- Slack ---
            case 'slack_send_message':
                return await executeSlackSendMessage(config, credentials, userId);

            // --- Notion ---
            case 'notion_create_page':
                return await executeNotionCreatePage(config, credentials, userId);
            case 'notion_query_db':
                return await executeNotionQueryDatabase(config, credentials, userId);

            // --- Google (Gmail/Calendar) ---
            case 'gmail_send_email':
                return await executeGmailSendEmail(config, credentials, userId);
            case 'calendar_create_event':
                return await executeCalendarCreateEvent(config, credentials, userId);
            case 'calendar_get_events':
                return await executeCalendarGetEvents(config, credentials, userId);

            // --- Google Docs ---
            case 'google_docs_create':
                return await executeGoogleDocsCreate(config, credentials, userId);
            case 'google_docs_append':
                return await executeGoogleDocsAppend(config, credentials, userId);
            case 'google_docs_get':
                return await executeGoogleDocsGet(config, credentials, userId);

            // --- Google Sheets ---
            case 'google_sheets_create':
                return await executeGoogleSheetsCreate(config, credentials, userId);
            case 'google_sheets_append':
                return await executeGoogleSheetsAppend(config, credentials, userId);
            case 'google_sheets_read':
                return await executeGoogleSheetsRead(config, credentials, userId);

            // --- Google Drive ---
            case 'google_drive_list_files':
                return await executeGoogleDriveListFiles(config, credentials, userId);

            // --- Jira ---
            case 'jira_create_issue':
                return await executeJiraCreateIssue(config, credentials, userId);
            case 'jira_search_issues':
                return await executeJiraSearchIssues(config, credentials, userId);
            case 'jira_get_issue':
                return await executeJiraGetIssue(config, credentials, userId);

            // --- Generic ---
            default:
                return {
                    success: false,
                    error: `Implementation for ${actionId} is not yet fully configured.`,
                    logs: [`Action ${actionId} not implemented.`]
                };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
            logs: [`Execution failed: ${error.message}`]
        };
    }
}

// ============================================================================
// JIRA (Atlassian)
// ============================================================================
async function getAtlassianCloudId(token: string): Promise<string> {
    const res = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const sites = await res.json();
    if (!res.ok) throw new Error(`Failed to get Atlassian resources: ${JSON.stringify(sites)}`);
    if (!sites || sites.length === 0) throw new Error("No accessible Atlassian resources found for this user.");
    return sites[0].id;
}

async function executeJiraCreateIssue(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('JIRA_ACCESS_TOKEN', credentials, userId);
    const cloudId = await getAtlassianCloudId(token);
    const { project_key, summary, description, issuetype = 'Task' } = config;

    if (!project_key || !summary) throw new Error("Jira 'project_key' and 'summary' are required.");

    const bodyData = {
        fields: {
            project: { key: project_key },
            summary: summary,
            description: {
                type: "doc",
                version: 1,
                content: [
                    {
                        type: "paragraph",
                        content: [
                            {
                                type: "text",
                                text: description || ""
                            }
                        ]
                    }
                ]
            },
            issuetype: { name: issuetype }
        }
    };

    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Jira Create Error: ${JSON.stringify(data)}`);

    return { success: true, output: data, logs: [`Created Jira issue ${data.key}`] };
}

async function executeJiraSearchIssues(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('JIRA_ACCESS_TOKEN', credentials, userId);
    const cloudId = await getAtlassianCloudId(token);
    const { jql } = config;

    const query = jql ? `?jql=${encodeURIComponent(jql)}` : '';
    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/search${query}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Jira Search Error: ${JSON.stringify(data)}`);

    return { success: true, output: data.issues, logs: [`Found ${data.issues?.length || 0} Jira issues`] };
}

async function executeJiraGetIssue(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('JIRA_ACCESS_TOKEN', credentials, userId);
    const cloudId = await getAtlassianCloudId(token);
    const { issue_key } = config;
    if (!issue_key) throw new Error("Jira 'issue_key' is required.");

    const response = await fetch(`https://api.atlassian.com/ex/jira/${cloudId}/rest/api/3/issue/${issue_key}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Jira Get Error: ${JSON.stringify(data)}`);

    return { success: true, output: data, logs: [`Retrieved Jira issue ${issue_key}`] };
}

// ============================================================================
// GENERIC HTTP
// ============================================================================
async function executeHttpRequest(config: any): Promise<ExecutionResult> {
    const { url, method = 'GET', headers, body } = config; // No token usage here yet unless generic
    if (!url) throw new Error("URL is required for http_request");

    const parsedHeaders = typeof headers === 'string' ? JSON.parse(headers || '{}') : headers;
    const parsedBody = typeof body === 'string' ? JSON.parse(body || '{}') : body;

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...parsedHeaders },
        body: method !== 'GET' ? JSON.stringify(parsedBody) : undefined
    });

    const data = await response.json().catch(() => ({ text: response.statusText }));
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);

    return { success: true, output: data, logs: [`Request to ${url} finished with status ${response.status}`] };
}

// ============================================================================
// SLACK
// ============================================================================
async function executeSlackSendMessage(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('SLACK_BOT_TOKEN', credentials, userId);
    const { channel, text } = config;
    if (!channel || !text) throw new Error("Slack 'channel' and 'text' are required.");

    const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, text })
    });

    const data = await response.json();
    if (!data.ok) throw new Error(`Slack API error: ${data.error}`);

    return { success: true, output: data, logs: [`Posted to Slack channel ${channel}`] };
}

// ============================================================================
// NOTION
// ============================================================================
async function executeNotionCreatePage(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('NOTION_API_KEY', credentials, userId);
    const { database_id, properties } = config;
    if (!database_id) throw new Error("Notion 'database_id' is required.");

    const parsedProps = typeof properties === 'string' ? JSON.parse(properties) : properties;

    const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent: { database_id }, properties: parsedProps || {} })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Notion API error: ${data.message || JSON.stringify(data)}`);

    return { success: true, output: data, logs: [`Created Notion page in DB ${database_id}`] };
}

async function executeNotionQueryDatabase(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('NOTION_API_KEY', credentials, userId);
    const { database_id, filter } = config;
    if (!database_id) throw new Error("Notion 'database_id' is required.");

    const parsedFilter = typeof filter === 'string' ? JSON.parse(filter) : filter;

    const response = await fetch(`https://api.notion.com/v1/databases/${database_id}/query`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
        body: parsedFilter ? JSON.stringify({ filter: parsedFilter }) : undefined
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Notion API error: ${data.message}`);

    return { success: true, output: data, logs: [`Queried Notion DB ${database_id}`] };
}

// ============================================================================
// GOOGLE
// ============================================================================
async function executeCalendarCreateEvent(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { summary, start_time } = config;
    if (!summary || !start_time) throw new Error("Calendar 'summary' and 'start_time' required.");

    const event = {
        summary,
        start: { dateTime: start_time },
        end: { dateTime: new Date(new Date(start_time).getTime() + 3600000).toISOString() }
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Calendar Error: ${data.error?.message || JSON.stringify(data)}`);

    return { success: true, output: data, logs: [`Created Calendar event: ${summary}`] };
}

async function executeCalendarGetEvents(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { time_min, max_results = 10 } = config;
    const timeMinQuery = time_min ? `&timeMin=${encodeURIComponent(time_min)}` : `&timeMin=${new Date().toISOString()}`;

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=${max_results}&singleEvents=true&orderBy=startTime${timeMinQuery}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Calendar Error: ${data.error?.message}`);

    return { success: true, output: data.items, logs: [`Retrieved ${data.items?.length || 0} events`] };
}

async function executeGmailSendEmail(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { to, subject, body } = config;
    if (!to || !subject || !body) throw new Error("Gmail 'to', 'subject', 'body' required.");

    const emailParts = [
        `To: ${to}`,
        `Subject: ${subject}`,
        `Content-Type: text/plain; charset=utf-8`,
        `MIME-Version: 1.0`,
        ``,
        body
    ];
    const emailRaw = emailParts.join('\r\n');
    const encodedEmail = Buffer.from(emailRaw).toString('base64url');

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: encodedEmail })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Gmail Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Email sent to ${to}`] };
}

// ============================================================================
// GOOGLE DOCS
// ============================================================================
async function executeGoogleDocsCreate(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { title, initial_content } = config;
    if (!title) throw new Error("Docs 'title' is required.");

    // 1. Create Document
    const createRes = await fetch('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });
    const doc = await createRes.json();
    if (!createRes.ok) throw new Error(`Google Docs Create Error: ${doc.error?.message}`);

    // 2. Insert Content if provided
    if (initial_content) {
        const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                requests: [{
                    insertText: {
                        location: { index: 1 },
                        text: initial_content
                    }
                }]
            })
        });
        if (!updateRes.ok) {
            const err = await updateRes.json();
            return { success: true, output: doc, logs: [`Document created but failed to insert content: ${err.error?.message}`] };
        }
    }

    return { success: true, output: doc, logs: [`Created Google Doc: ${title}`] };
}

async function executeGoogleDocsAppend(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { document_id, text } = config;
    if (!document_id || !text) throw new Error("Docs 'document_id' and 'text' required.");

    const response = await fetch(`https://docs.googleapis.com/v1/documents/${document_id}:batchUpdate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            requests: [{
                insertText: {
                    endOfSegmentLocation: { segmentId: "" }, // End of body
                    text: text
                }
            }]
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Docs Append Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Appended text to Doc ${document_id}`] };
}

async function executeGoogleDocsGet(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { document_id } = config;
    if (!document_id) throw new Error("Docs 'document_id' required.");

    const response = await fetch(`https://docs.googleapis.com/v1/documents/${document_id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Docs Get Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Retrieved Doc ${document_id}`] };
}

// ============================================================================
// GOOGLE SHEETS
// ============================================================================
async function executeGoogleSheetsCreate(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { title } = config;
    if (!title) throw new Error("Sheets 'title' required.");

    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: { title } })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Sheets Create Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Created Spreadsheet: ${title}`] };
}

async function executeGoogleSheetsAppend(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { spreadsheet_id, values } = config; // values should be comma separated string or array
    if (!spreadsheet_id || !values) throw new Error("Sheets 'spreadsheet_id' and 'values' required.");

    const rowValues = Array.isArray(values) ? values : (typeof values === 'string' ? values.split(',') : [values]);

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/A1:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            values: [rowValues]
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Sheets Append Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Appended row to Sheet ${spreadsheet_id}`] };
}

async function executeGoogleSheetsRead(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { spreadsheet_id, range = 'A1:Z100' } = config;
    if (!spreadsheet_id) throw new Error("Sheets 'spreadsheet_id' required.");

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheet_id}/values/${range}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Sheets Read Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Read range ${range} from Sheet ${spreadsheet_id}`] };
}

// ============================================================================
// GOOGLE DRIVE
// ============================================================================
async function executeGoogleDriveListFiles(config: any, credentials?: Record<string, string>, userId?: string): Promise<ExecutionResult> {
    const token = await getToken('GOOGLE_ACCESS_TOKEN', credentials, userId);
    const { query, limit = 10 } = config;
    const qParam = query ? `&q=${encodeURIComponent(query)}` : '';

    const response = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${limit}${qParam}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(`Google Drive List Error: ${data.error?.message}`);

    return { success: true, output: data, logs: [`Listed ${data.files?.length || 0} files`] };
}
