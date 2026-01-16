import {
    Calendar,
    Terminal,
    Container,
    Mail,
    FileText,
    MessageSquare,
    Linkedin,
    Github,
    Globe,
    Database,
    Slack,
    Trello,
    Box,
    Zap,
    Search,
    Send,
    PlusCircle,
    Play,
    Instagram,
    Twitter,
    Youtube,
    Video,
    Share2,
    Table,
    CheckSquare,
    Cloud,
    CreditCard,
    MessageCircle,
    Hash,
    Sheet,
    Phone,
    AlertTriangle
} from 'lucide-react';

export type ActionType =
    // Instagram
    | 'instagram_post_photo'
    | 'instagram_get_profile'
    | 'instagram_update_profile'
    | 'instagram_get_media'
    | 'instagram_get_mentions'
    | 'instagram_get_hashtag_media'
    | 'instagram_like_media'
    | 'instagram_unlike_media'
    | 'instagram_get_insights_account'
    | 'instagram_get_insights_media'
    // X (Twitter)
    | 'x_post_tweet'
    | 'x_search_tweets'
    | 'x_get_user_profile'
    | 'x_get_user_tweets'
    | 'x_follow_user'
    | 'x_unfollow_user'
    | 'x_get_followers'
    | 'x_get_following'
    | 'x_get_trending'
    // LinkedIn
    | 'linkedin_create_post'
    | 'linkedin_get_connections'
    | 'linkedin_send_message'
    | 'linkedin_like_post'
    | 'linkedin_get_analytics'
    // YouTube
    | 'youtube_upload_video'
    | 'youtube_get_metrics'
    // Reddit
    | 'reddit_create_post'
    // WhatsApp
    | 'whatsapp_send_message'
    | 'whatsapp_send_image'
    | 'whatsapp_send_document'
    | 'whatsapp_send_location'
    // Google Chat
    | 'google_chat_send_message'
    // Slack
    | 'slack_send_message'
    | 'slack_list_channels'
    | 'slack_send_dm'
    | 'slack_update_message'
    | 'slack_delete_message'
    | 'slack_add_reaction'
    | 'slack_upload_file'
    // Gmail
    | 'gmail_send_email'
    | 'gmail_search'
    | 'gmail_reply'
    | 'gmail_delete_email'
    | 'gmail_mark_read'
    | 'gmail_mark_unread'
    // Notion
    | 'notion_create_page'
    | 'notion_query_db'
    | 'notion_get_page'
    | 'notion_update_page'
    | 'notion_delete_page'
    | 'notion_append_block'
    | 'notion_get_database'
    | 'notion_create_database'
    | 'notion_search'
    | 'notion_get_users'
    // Google Docs
    | 'google_docs_create'
    | 'google_docs_append'
    | 'google_docs_get'
    | 'google_docs_insert'
    | 'google_docs_replace_text'
    | 'google_docs_copy'
    | 'google_docs_delete'
    | 'google_docs_share'
    // Google Sheets
    | 'google_sheets_read'
    | 'google_sheets_append'
    | 'google_sheets_create'
    | 'google_sheets_update'
    | 'google_sheets_clear'
    | 'google_sheets_batch_update'
    | 'google_sheets_format'
    // Google Drive
    | 'google_drive_upload'
    | 'google_drive_list_files'
    | 'google_drive_delete_file'
    | 'google_drive_share_file'
    // Google Calendar
    | 'calendar_create_event'
    | 'calendar_get_events'
    | 'calendar_update_event'
    | 'calendar_delete_event'
    | 'calendar_get_event'
    // Airtable
    | 'airtable_create_record'
    | 'airtable_list_records'
    | 'airtable_get_base'
    | 'airtable_update_record'
    | 'airtable_delete_record'
    // Trello
    | 'trello_create_card'
    | 'trello_move_card'
    | 'trello_delete_card'
    // Jira
    | 'jira_create_issue'
    | 'jira_transition_issue'
    | 'jira_add_comment'
    // Asana
    | 'asana_create_task'
    | 'asana_complete_task'
    // Todoist
    | 'todoist_create_task'
    | 'todoist_list_tasks'
    // Excel
    | 'excel_add_row'
    // Zoom
    | 'zoom_create_meeting'
    | 'zoom_delete_meeting'
    // Twilio
    | 'twilio_send_sms'
    | 'twilio_make_call'
    // PagerDuty
    | 'pagerduty_trigger_incident'
    | 'pagerduty_resolve_incident'
    // GitHub
    | 'github_create_issue'
    | 'github_create_pr'
    | 'github_get_repo'
    | 'github_list_repos'
    | 'github_list_issues'
    | 'github_close_issue'
    | 'github_merge_pr'
    | 'github_list_commits'
    | 'github_create_release'
    // Supabase
    | 'supabase_query'
    | 'supabase_insert'
    | 'supabase_select'
    | 'supabase_update'
    | 'supabase_delete'
    // MySQL
    | 'mysql_query'
    // Redis
    | 'redis_set'
    | 'redis_get'
    | 'redis_delete'
    // Amazon S3
    | 's3_upload_file'
    | 's3_list_objects'
    | 's3_download_file'
    | 's3_delete_object'
    // Stripe
    | 'stripe_get_payments'
    | 'stripe_create_invoice'
    | 'stripe_list_customers'
    | 'stripe_create_customer'
    | 'stripe_list_payments'
    | 'stripe_finalize_invoice'
    // Vercel
    | 'vercel_deploy'
    | 'vercel_list_projects'
    // Docker
    | 'docker_list_containers'
    | 'docker_container_action'
    // Generic
    | 'http_request'
    | 'script_run';

export interface ActionField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    options?: string[];
    placeholder?: string;
}

export interface ActionDefinition {
    id: ActionType;
    platform: string;
    name: string;
    icon: any;
    color: string;
    description: string;
    fields: ActionField[];
}

export const SUPPORTED_ACTIONS: ActionDefinition[] = [
    // --- Instagram ---
    { id: 'instagram_post_photo', platform: 'Instagram', name: 'Post Photo', icon: Instagram, color: '#E4405F', description: 'Upload a photo to feed', fields: [{ key: 'image_url', label: 'Image URL', type: 'text' }, { key: 'caption', label: 'Caption', type: 'textarea' }] },
    { id: 'instagram_get_profile', platform: 'Instagram', name: 'Get Profile', icon: Instagram, color: '#E4405F', description: 'Get account info', fields: [] },
    { id: 'instagram_update_profile', platform: 'Instagram', name: 'Update Profile', icon: Instagram, color: '#E4405F', description: 'Update bio and website', fields: [{ key: 'biography', label: 'Bio', type: 'textarea' }, { key: 'website', label: 'Website', type: 'text' }] },
    { id: 'instagram_get_media', platform: 'Instagram', name: 'Get Media', icon: Instagram, color: '#E4405F', description: 'List posts', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'instagram_get_mentions', platform: 'Instagram', name: 'Get Mentions', icon: Instagram, color: '#E4405F', description: 'Mentions', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'instagram_get_hashtag_media', platform: 'Instagram', name: 'Search Hashtag', icon: Instagram, color: '#E4405F', description: 'Hashtag search', fields: [{ key: 'hashtag', label: 'Hashtag', type: 'text' }] },
    { id: 'instagram_like_media', platform: 'Instagram', name: 'Like Media', icon: Instagram, color: '#E4405F', description: 'Like post', fields: [{ key: 'media_id', label: 'Media ID', type: 'text' }] },
    { id: 'instagram_unlike_media', platform: 'Instagram', name: 'Unlike Media', icon: Instagram, color: '#E4405F', description: 'Unlike post', fields: [{ key: 'media_id', label: 'Media ID', type: 'text' }] },
    { id: 'instagram_get_insights_account', platform: 'Instagram', name: 'Account Insights', icon: Instagram, color: '#E4405F', description: 'Account analytics', fields: [{ key: 'metric', label: 'Metric', type: 'select', options: ['impressions', 'reach', 'profile_views'] }] },
    { id: 'instagram_get_insights_media', platform: 'Instagram', name: 'Media Insights', icon: Instagram, color: '#E4405F', description: 'Post analytics', fields: [{ key: 'media_id', label: 'Media ID', type: 'text' }, { key: 'metric', label: 'Metric', type: 'select', options: ['likes', 'comments', 'shares', 'saves'] }] },

    // --- X (Twitter) ---
    { id: 'x_post_tweet', platform: 'X (Twitter)', name: 'Post Tweet', icon: Twitter, color: '#000000', description: 'Post a new tweet', fields: [{ key: 'text', label: 'Tweet Content', type: 'textarea' }] },
    { id: 'x_search_tweets', platform: 'X (Twitter)', name: 'Search Tweets', icon: Twitter, color: '#000000', description: 'Search for tweets', fields: [{ key: 'query', label: 'Query', type: 'text', placeholder: 'nextjs build' }, { key: 'limit', label: 'Limit', type: 'number', placeholder: '10' }] },
    { id: 'x_get_user_profile', platform: 'X (Twitter)', name: 'Get Profile', icon: Twitter, color: '#000', description: 'User profile', fields: [{ key: 'username', label: 'Username', type: 'text' }] },
    { id: 'x_get_user_tweets', platform: 'X (Twitter)', name: 'Get User Tweets', icon: Twitter, color: '#000', description: 'User tweets', fields: [{ key: 'username', label: 'Username', type: 'text' }, { key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'x_follow_user', platform: 'X (Twitter)', name: 'Follow User', icon: Twitter, color: '#000', description: 'Follow', fields: [{ key: 'username', label: 'Username', type: 'text' }] },
    { id: 'x_unfollow_user', platform: 'X (Twitter)', name: 'Unfollow User', icon: Twitter, color: '#000', description: 'Unfollow', fields: [{ key: 'username', label: 'Username', type: 'text' }] },
    { id: 'x_get_followers', platform: 'X (Twitter)', name: 'Get Followers', icon: Twitter, color: '#000', description: 'Followers', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'x_get_following', platform: 'X (Twitter)', name: 'Get Following', icon: Twitter, color: '#000', description: 'Following', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'x_get_trending', platform: 'X (Twitter)', name: 'Trending Topics', icon: Twitter, color: '#000', description: 'Trends', fields: [{ key: 'location', label: 'WOEID', type: 'text' }] },

    // --- LinkedIn ---
    { id: 'linkedin_create_post', platform: 'LinkedIn', name: 'Create Post', icon: Linkedin, color: '#0A66C2', description: 'Share update on profile/page', fields: [{ key: 'content', label: 'Content', type: 'textarea' }, { key: 'visibility', label: 'Visibility', type: 'select', options: ['PUBLIC', 'CONNECTIONS'] }] },
    { id: 'linkedin_get_connections', platform: 'LinkedIn', name: 'Get Connections', icon: Linkedin, color: '#0A66C2', description: 'Connections', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'linkedin_send_message', platform: 'LinkedIn', name: 'Send Message', icon: Linkedin, color: '#0A66C2', description: 'DM', fields: [{ key: 'recipient_id', label: 'Recipient ID', type: 'text' }, { key: 'message', label: 'Message', type: 'textarea' }] },
    { id: 'linkedin_like_post', platform: 'LinkedIn', name: 'Like Post', icon: Linkedin, color: '#0A66C2', description: 'React', fields: [{ key: 'post_id', label: 'Post ID', type: 'text' }, { key: 'reaction', label: 'Reaction', type: 'select', options: ['LIKE', 'LOVE', 'SUPPORT', 'INSIGHTFUL', 'CELEBRATE'] }] },
    { id: 'linkedin_get_analytics', platform: 'LinkedIn', name: 'Get Analytics', icon: Linkedin, color: '#0A66C2', description: 'Analytics', fields: [{ key: 'post_id', label: 'Post ID (optional)', type: 'text' }] },

    // --- YouTube ---
    { id: 'youtube_upload_video', platform: 'YouTube', name: 'Upload Video', icon: Youtube, color: '#FF0000', description: 'Upload a video file', fields: [{ key: 'file_url', label: 'Video URL', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' }] },
    { id: 'youtube_get_metrics', platform: 'YouTube', name: 'Get Metrics', icon: Youtube, color: '#FF0000', description: 'Get channel statistics', fields: [{ key: 'video_id', label: 'Video ID (Optional)', type: 'text' }, { key: 'metric', label: 'Metric', type: 'select', options: ['views', 'subscribers', 'likes'] }] },

    // --- Reddit ---
    { id: 'reddit_create_post', platform: 'Reddit', name: 'Create Post', icon: MessageCircle, color: '#FF4500', description: 'Submit a new post', fields: [{ key: 'subreddit', label: 'Subreddit', type: 'text', placeholder: 'r/reactjs' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'text', label: 'Body', type: 'textarea' }] },

    // --- WhatsApp ---
    { id: 'whatsapp_send_message', platform: 'WhatsApp', name: 'Send Message', icon: MessageCircle, color: '#25D366', description: 'Send a WhatsApp message', fields: [{ key: 'to', label: 'Phone Number', type: 'text' }, { key: 'message', label: 'Message', type: 'textarea' }] },
    { id: 'whatsapp_send_image', platform: 'WhatsApp', name: 'Send Image', icon: MessageCircle, color: '#25D366', description: 'Send image', fields: [{ key: 'to', label: 'Phone', type: 'text' }, { key: 'image_url', label: 'Image URL', type: 'text' }, { key: 'caption', label: 'Caption', type: 'text' }] },
    { id: 'whatsapp_send_document', platform: 'WhatsApp', name: 'Send Document', icon: MessageCircle, color: '#25D366', description: 'Send document', fields: [{ key: 'to', label: 'Phone', type: 'text' }, { key: 'document_url', label: 'Document URL', type: 'text' }, { key: 'filename', label: 'Filename', type: 'text' }] },
    { id: 'whatsapp_send_location', platform: 'WhatsApp', name: 'Send Location', icon: MessageCircle, color: '#25D366', description: 'Send location', fields: [{ key: 'to', label: 'Phone', type: 'text' }, { key: 'latitude', label: 'Latitude', type: 'text' }, { key: 'longitude', label: 'Longitude', type: 'text' }] },

    // --- Google Chat ---
    { id: 'google_chat_send_message', platform: 'Google Chat', name: 'Send Message', icon: MessageSquare, color: '#00AC47', description: 'Send message to space', fields: [{ key: 'space_name', label: 'Space Name', type: 'text' }, { key: 'text', label: 'Message', type: 'textarea' }] },

    // --- Slack ---
    { id: 'slack_send_message', platform: 'Slack', name: 'Send Message', icon: Slack, color: '#4A154B', description: 'Post to channel', fields: [{ key: 'channel', label: 'Channel', type: 'text', placeholder: '#general' }, { key: 'text', label: 'Message', type: 'textarea' }] },
    { id: 'slack_list_channels', platform: 'Slack', name: 'List Channels', icon: Slack, color: '#4A154B', description: 'Get list of channels', fields: [] },
    { id: 'slack_send_dm', platform: 'Slack', name: 'Send DM', icon: Slack, color: '#4A154B', description: 'Send DM', fields: [{ key: 'user_id', label: 'User ID', type: 'text' }, { key: 'text', label: 'Message', type: 'textarea' }] },
    { id: 'slack_update_message', platform: 'Slack', name: 'Update Message', icon: Slack, color: '#4A154B', description: 'Edit message', fields: [{ key: 'channel', label: 'Channel', type: 'text' }, { key: 'timestamp', label: 'Timestamp', type: 'text' }, { key: 'text', label: 'Text', type: 'textarea' }] },
    { id: 'slack_delete_message', platform: 'Slack', name: 'Delete Message', icon: Slack, color: '#4A154B', description: 'Delete message', fields: [{ key: 'channel', label: 'Channel', type: 'text' }, { key: 'timestamp', label: 'Timestamp', type: 'text' }] },
    { id: 'slack_add_reaction', platform: 'Slack', name: 'Add Reaction', icon: Slack, color: '#4A154B', description: 'Add reaction', fields: [{ key: 'channel', label: 'Channel', type: 'text' }, { key: 'timestamp', label: 'Timestamp', type: 'text' }, { key: 'emoji', label: 'Emoji', type: 'text' }] },
    { id: 'slack_upload_file', platform: 'Slack', name: 'Upload File', icon: Slack, color: '#4A154B', description: 'Upload file', fields: [{ key: 'channel', label: 'Channel', type: 'text' }, { key: 'file_url', label: 'File URL', type: 'text' }] },

    // --- Gmail ---
    { id: 'gmail_send_email', platform: 'Gmail', name: 'Send Email', icon: Mail, color: '#EA4335', description: 'Send an email', fields: [{ key: 'to', label: 'To', type: 'text' }, { key: 'subject', label: 'Subject', type: 'text' }, { key: 'body', label: 'Body', type: 'textarea' }] },
    { id: 'gmail_search', platform: 'Gmail', name: 'Search Emails', icon: Search, color: '#EA4335', description: 'Find emails', fields: [{ key: 'query', label: 'Query', type: 'text', placeholder: 'from:boss' }] },
    { id: 'gmail_reply', platform: 'Gmail', name: 'Reply Email', icon: Mail, color: '#EA4335', description: 'Reply', fields: [{ key: 'thread_id', label: 'Thread ID', type: 'text' }, { key: 'body', label: 'Body', type: 'textarea' }] },
    { id: 'gmail_delete_email', platform: 'Gmail', name: 'Delete Email', icon: Mail, color: '#EA4335', description: 'Delete', fields: [{ key: 'message_id', label: 'Message ID', type: 'text' }] },
    { id: 'gmail_mark_read', platform: 'Gmail', name: 'Mark Read', icon: Mail, color: '#EA4335', description: 'Mark read', fields: [{ key: 'message_id', label: 'Message ID', type: 'text' }] },
    { id: 'gmail_mark_unread', platform: 'Gmail', name: 'Mark Unread', icon: Mail, color: '#EA4335', description: 'Mark unread', fields: [{ key: 'message_id', label: 'Message ID', type: 'text' }] },

    // --- Notion ---
    { id: 'notion_create_page', platform: 'Notion', name: 'Create Page', icon: FileText, color: '#000000', description: 'Add page to database', fields: [{ key: 'database_id', label: 'Database ID', type: 'text' }, { key: 'properties', label: 'Properties (JSON)', type: 'textarea' }] },
    { id: 'notion_query_db', platform: 'Notion', name: 'Query Database', icon: Search, color: '#000000', description: 'Search/filter database', fields: [{ key: 'database_id', label: 'Database ID', type: 'text' }, { key: 'filter', label: 'Filter (JSON)', type: 'textarea' }] },
    { id: 'notion_get_page', platform: 'Notion', name: 'Get Page', icon: FileText, color: '#000000', description: 'Retrieve page', fields: [{ key: 'page_id', label: 'Page ID', type: 'text' }] },
    { id: 'notion_update_page', platform: 'Notion', name: 'Update Page', icon: FileText, color: '#000000', description: 'Update page', fields: [{ key: 'page_id', label: 'Page ID', type: 'text' }, { key: 'properties', label: 'Properties (JSON)', type: 'textarea' }] },
    { id: 'notion_delete_page', platform: 'Notion', name: 'Delete Page', icon: FileText, color: '#000000', description: 'Archive page', fields: [{ key: 'page_id', label: 'Page ID', type: 'text' }] },
    { id: 'notion_append_block', platform: 'Notion', name: 'Append Block', icon: FileText, color: '#000000', description: 'Append block', fields: [{ key: 'page_id', label: 'Page ID', type: 'text' }, { key: 'block_content', label: 'Block Content (JSON)', type: 'textarea' }] },
    { id: 'notion_get_database', platform: 'Notion', name: 'Get Database', icon: Database, color: '#000000', description: 'Database schema', fields: [{ key: 'database_id', label: 'Database ID', type: 'text' }] },
    { id: 'notion_create_database', platform: 'Notion', name: 'Create Database', icon: Database, color: '#000000', description: 'Create DB', fields: [{ key: 'parent_page_id', label: 'Parent Page ID', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'properties', label: 'Properties (JSON)', type: 'textarea' }] },
    { id: 'notion_search', platform: 'Notion', name: 'Search', icon: Search, color: '#000000', description: 'Search workspace', fields: [{ key: 'query', label: 'Query', type: 'text' }] },
    { id: 'notion_get_users', platform: 'Notion', name: 'Get Users', icon: FileText, color: '#000000', description: 'List users', fields: [] },

    // --- Google Docs ---
    { id: 'google_docs_create', platform: 'Google Docs', name: 'Create Doc', icon: FileText, color: '#4285F4', description: 'Create new document', fields: [{ key: 'title', label: 'Title', type: 'text' }, { key: 'initial_content', label: 'Content', type: 'textarea' }] },
    { id: 'google_docs_append', platform: 'Google Docs', name: 'Append Text', icon: FileText, color: '#4285F4', description: 'Append text to document', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }, { key: 'text', label: 'Text to append', type: 'textarea' }] },
    { id: 'google_docs_get', platform: 'Google Docs', name: 'Get Doc', icon: FileText, color: '#4285F4', description: 'Read document', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }] },
    { id: 'google_docs_insert', platform: 'Google Docs', name: 'Insert Text', icon: FileText, color: '#4285F4', description: 'Insert text', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }, { key: 'index', label: 'Index', type: 'number' }, { key: 'text', label: 'Text', type: 'textarea' }] },
    { id: 'google_docs_replace_text', platform: 'Google Docs', name: 'Replace Text', icon: FileText, color: '#4285F4', description: 'Find & replace', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }, { key: 'find', label: 'Find', type: 'text' }, { key: 'replace', label: 'Replace', type: 'text' }] },
    { id: 'google_docs_copy', platform: 'Google Docs', name: 'Copy Doc', icon: FileText, color: '#4285F4', description: 'Duplicate doc', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }, { key: 'new_title', label: 'New Title', type: 'text' }] },
    { id: 'google_docs_delete', platform: 'Google Docs', name: 'Delete Doc', icon: FileText, color: '#4285F4', description: 'Delete doc', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }] },
    { id: 'google_docs_share', platform: 'Google Docs', name: 'Share Doc', icon: FileText, color: '#4285F4', description: 'Share document', fields: [{ key: 'document_id', label: 'Document ID', type: 'text' }, { key: 'email', label: 'Email', type: 'text' }, { key: 'role', label: 'Role', type: 'select', options: ['reader', 'writer', 'commenter'] }] },

    // --- Google Sheets ---
    { id: 'google_sheets_append', platform: 'Google Sheets', name: 'Append Row', icon: Sheet, color: '#34A853', description: 'Add row to spreadsheet', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'values', label: 'Values (Comma separated)', type: 'text' }] },
    { id: 'google_sheets_read', platform: 'Google Sheets', name: 'Read Values', icon: Sheet, color: '#34A853', description: 'Read values from range', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'range', label: 'Range (e.g. A1:B10)', type: 'text' }] },
    { id: 'google_sheets_create', platform: 'Google Sheets', name: 'Create Sheet', icon: Sheet, color: '#34A853', description: 'Create spreadsheet', fields: [{ key: 'title', label: 'Title', type: 'text' }] },
    { id: 'google_sheets_update', platform: 'Google Sheets', name: 'Update Values', icon: Sheet, color: '#34A853', description: 'Update range', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'range', label: 'Range', type: 'text' }, { key: 'values', label: 'Values (JSON)', type: 'textarea' }] },
    { id: 'google_sheets_clear', platform: 'Google Sheets', name: 'Clear Values', icon: Sheet, color: '#34A853', description: 'Clear range', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'range', label: 'Range', type: 'text' }] },
    { id: 'google_sheets_batch_update', platform: 'Google Sheets', name: 'Batch Update', icon: Sheet, color: '#34A853', description: 'Batch update', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'data', label: 'Data (JSON)', type: 'textarea' }] },
    { id: 'google_sheets_format', platform: 'Google Sheets', name: 'Format Cells', icon: Sheet, color: '#34A853', description: 'Format cells', fields: [{ key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text' }, { key: 'range', label: 'Range', type: 'text' }, { key: 'format', label: 'Format (JSON)', type: 'textarea' }] },

    // --- Google Drive ---
    { id: 'google_drive_upload', platform: 'Google Drive', name: 'Upload File', icon: Cloud, color: '#4285F4', description: 'Upload file', fields: [{ key: 'file_url', label: 'File URL', type: 'text' }, { key: 'name', label: 'File Name', type: 'text' }, { key: 'folder_id', label: 'Folder ID', type: 'text' }] },
    { id: 'google_drive_list_files', platform: 'Google Drive', name: 'List Files', icon: Cloud, color: '#4285F4', description: 'List files', fields: [{ key: 'query', label: 'Query', type: 'text' }] },
    { id: 'google_drive_delete_file', platform: 'Google Drive', name: 'Delete File', icon: Cloud, color: '#4285F4', description: 'Delete file', fields: [{ key: 'file_id', label: 'File ID', type: 'text' }] },
    { id: 'google_drive_share_file', platform: 'Google Drive', name: 'Share File', icon: Cloud, color: '#4285F4', description: 'Share file', fields: [{ key: 'file_id', label: 'File ID', type: 'text' }, { key: 'email', label: 'Email', type: 'text' }, { key: 'role', label: 'Role', type: 'select', options: ['reader', 'writer', 'commenter'] }] },

    // --- Google Calendar ---
    { id: 'calendar_create_event', platform: 'Google Calendar', name: 'Create Event', icon: Calendar, color: '#4285F4', description: 'Schedule event', fields: [{ key: 'summary', label: 'Title', type: 'text' }, { key: 'start_time', label: 'Start Time', type: 'text' }] },
    { id: 'calendar_get_events', platform: 'Google Calendar', name: 'Get Events', icon: Calendar, color: '#4285F4', description: 'List upcoming events', fields: [{ key: 'time_min', label: 'From Time', type: 'text', placeholder: 'Now' }, { key: 'max_results', label: 'Max Results', type: 'number' }] },
    { id: 'calendar_update_event', platform: 'Google Calendar', name: 'Update Event', icon: Calendar, color: '#4285F4', description: 'Update event', fields: [{ key: 'event_id', label: 'Event ID', type: 'text' }, { key: 'summary', label: 'Summary', type: 'text' }] },
    { id: 'calendar_delete_event', platform: 'Google Calendar', name: 'Delete Event', icon: Calendar, color: '#4285F4', description: 'Delete event', fields: [{ key: 'event_id', label: 'Event ID', type: 'text' }] },
    { id: 'calendar_get_event', platform: 'Google Calendar', name: 'Get Event', icon: Calendar, color: '#4285F4', description: 'Get event', fields: [{ key: 'event_id', label: 'Event ID', type: 'text' }] },

    // --- Airtable ---
    { id: 'airtable_create_record', platform: 'Airtable', name: 'Create Record', icon: Table, color: '#F82B60', description: 'Add record to base', fields: [{ key: 'base_id', label: 'Base ID', type: 'text' }, { key: 'table', label: 'Table Name', type: 'text' }, { key: 'fields', label: 'Fields (JSON)', type: 'textarea' }] },
    { id: 'airtable_list_records', platform: 'Airtable', name: 'List Records', icon: Table, color: '#F82B60', description: 'List/filter records', fields: [{ key: 'base_id', label: 'Base ID', type: 'text' }, { key: 'table', label: 'Table Name', type: 'text' }] },
    { id: 'airtable_get_base', platform: 'Airtable', name: 'Get Base', icon: Table, color: '#F82B60', description: 'Get base schema', fields: [{ key: 'base_id', label: 'Base ID', type: 'text' }] },
    { id: 'airtable_update_record', platform: 'Airtable', name: 'Update Record', icon: Table, color: '#F82B60', description: 'Update record', fields: [{ key: 'base_id', label: 'Base ID', type: 'text' }, { key: 'table', label: 'Table', type: 'text' }, { key: 'record_id', label: 'Record ID', type: 'text' }, { key: 'fields', label: 'Fields (JSON)', type: 'textarea' }] },
    { id: 'airtable_delete_record', platform: 'Airtable', name: 'Delete Record', icon: Table, color: '#F82B60', description: 'Delete record', fields: [{ key: 'base_id', label: 'Base ID', type: 'text' }, { key: 'table', label: 'Table', type: 'text' }, { key: 'record_id', label: 'Record ID', type: 'text' }] },

    // --- Trello ---
    { id: 'trello_create_card', platform: 'Trello', name: 'Create Card', icon: Trello, color: '#0079BF', description: 'Create card', fields: [{ key: 'list_id', label: 'List ID', type: 'text' }, { key: 'name', label: 'Name', type: 'text' }, { key: 'desc', label: 'Description', type: 'textarea' }] },
    { id: 'trello_move_card', platform: 'Trello', name: 'Move Card', icon: Trello, color: '#0079BF', description: 'Move card', fields: [{ key: 'card_id', label: 'Card ID', type: 'text' }, { key: 'list_id', label: 'Target List ID', type: 'text' }] },
    { id: 'trello_delete_card', platform: 'Trello', name: 'Delete Card', icon: Trello, color: '#0079BF', description: 'Delete card', fields: [{ key: 'card_id', label: 'Card ID', type: 'text' }] },

    // --- Jira ---
    { id: 'jira_create_issue', platform: 'Jira', name: 'Create Issue', icon: Table, color: '#0052CC', description: 'Create issue', fields: [{ key: 'project_key', label: 'Project Key', type: 'text' }, { key: 'summary', label: 'Summary', type: 'text' }, { key: 'issue_type', label: 'Issue Type', type: 'text' }] },
    { id: 'jira_transition_issue', platform: 'Jira', name: 'Transition Issue', icon: Table, color: '#0052CC', description: 'Change status', fields: [{ key: 'issue_id', label: 'Issue ID', type: 'text' }, { key: 'transition_id', label: 'Transition ID', type: 'text' }] },
    { id: 'jira_add_comment', platform: 'Jira', name: 'Add Comment', icon: Table, color: '#0052CC', description: 'Add comment', fields: [{ key: 'issue_id', label: 'Issue ID', type: 'text' }, { key: 'comment', label: 'Comment', type: 'textarea' }] },

    // --- Asana ---
    { id: 'asana_create_task', platform: 'Asana', name: 'Create Task', icon: CheckSquare, color: '#F06A6A', description: 'Create task', fields: [{ key: 'project_id', label: 'Project ID', type: 'text' }, { key: 'name', label: 'Name', type: 'text' }] },
    { id: 'asana_complete_task', platform: 'Asana', name: 'Complete Task', icon: CheckSquare, color: '#F06A6A', description: 'Complete task', fields: [{ key: 'task_id', label: 'Task ID', type: 'text' }] },

    // --- Todoist ---
    { id: 'todoist_create_task', platform: 'Todoist', name: 'Create Task', icon: CheckSquare, color: '#E44332', description: 'Add a new task', fields: [{ key: 'content', label: 'Task Name', type: 'text' }, { key: 'project_id', label: 'Project ID', type: 'text' }] },
    { id: 'todoist_list_tasks', platform: 'Todoist', name: 'List Tasks', icon: CheckSquare, color: '#E44332', description: 'Get active tasks', fields: [{ key: 'filter', label: 'Filter (e.g. "today")', type: 'text' }] },

    // --- Excel ---
    { id: 'excel_add_row', platform: 'Excel', name: 'Add Row', icon: Table, color: '#217346', description: 'Add row to spreadsheet', fields: [{ key: 'file_id', label: 'File ID', type: 'text' }, { key: 'worksheet', label: 'Worksheet', type: 'text' }, { key: 'values', label: 'Values (JSON)', type: 'textarea' }] },

    // --- Zoom ---
    { id: 'zoom_create_meeting', platform: 'Zoom', name: 'Create Meeting', icon: Video, color: '#2D8CFF', description: 'Create meeting', fields: [{ key: 'topic', label: 'Topic', type: 'text' }, { key: 'start_time', label: 'Start Time', type: 'text' }] },
    { id: 'zoom_delete_meeting', platform: 'Zoom', name: 'Delete Meeting', icon: Video, color: '#2D8CFF', description: 'Delete meeting', fields: [{ key: 'meeting_id', label: 'Meeting ID', type: 'text' }] },

    // --- Twilio ---
    { id: 'twilio_send_sms', platform: 'Twilio', name: 'Send SMS', icon: MessageCircle, color: '#F22F46', description: 'Send SMS', fields: [{ key: 'to', label: 'To', type: 'text' }, { key: 'message', label: 'Message', type: 'textarea' }] },
    { id: 'twilio_make_call', platform: 'Twilio', name: 'Make Call', icon: Phone, color: '#F22F46', description: 'Make call', fields: [{ key: 'to', label: 'To', type: 'text' }, { key: 'from', label: 'From', type: 'text' }] },

    // --- PagerDuty ---
    { id: 'pagerduty_trigger_incident', platform: 'PagerDuty', name: 'Trigger Incident', icon: AlertTriangle, color: '#06AC38', description: 'Trigger incident', fields: [{ key: 'service_id', label: 'Service ID', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }] },
    { id: 'pagerduty_resolve_incident', platform: 'PagerDuty', name: 'Resolve Incident', icon: AlertTriangle, color: '#06AC38', description: 'Resolve incident', fields: [{ key: 'incident_id', label: 'Incident ID', type: 'text' }] },

    // --- GitHub ---
    { id: 'github_create_issue', platform: 'GitHub', name: 'Create Issue', icon: Github, color: '#181717', description: 'Open new issue', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'body', label: 'Body', type: 'textarea' }] },
    { id: 'github_create_pr', platform: 'GitHub', name: 'Create PR', icon: Github, color: '#181717', description: 'Open pull request', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'title', label: 'Title', type: 'text' }, { key: 'head', label: 'Head Branch', type: 'text' }, { key: 'base', label: 'Base Branch', type: 'text' }] },
    { id: 'github_get_repo', platform: 'GitHub', name: 'Get Repository', icon: Github, color: '#181717', description: 'Get repo info', fields: [{ key: 'repo', label: 'Repository (owner/name)', type: 'text' }] },
    { id: 'github_list_repos', platform: 'GitHub', name: 'List Repositories', icon: Github, color: '#181717', description: 'List user repos', fields: [{ key: 'username', label: 'Username', type: 'text' }] },
    { id: 'github_list_issues', platform: 'GitHub', name: 'List Issues', icon: Github, color: '#181717', description: 'List issues', fields: [{ key: 'repo', label: 'Repository', type: 'text' }] },
    { id: 'github_close_issue', platform: 'GitHub', name: 'Close Issue', icon: Github, color: '#181717', description: 'Close issue', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'issue_number', label: 'Issue Number', type: 'number' }] },
    { id: 'github_merge_pr', platform: 'GitHub', name: 'Merge Pull Request', icon: Github, color: '#181717', description: 'Merge PR', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'pr_number', label: 'PR Number', type: 'number' }] },
    { id: 'github_list_commits', platform: 'GitHub', name: 'List Commits', icon: Github, color: '#181717', description: 'List commits', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'branch', label: 'Branch', type: 'text' }] },
    { id: 'github_create_release', platform: 'GitHub', name: 'Create Release', icon: Github, color: '#181717', description: 'Create release', fields: [{ key: 'repo', label: 'Repository', type: 'text' }, { key: 'tag', label: 'Tag', type: 'text' }, { key: 'name', label: 'Name', type: 'text' }] },

    // --- Supabase ---
    { id: 'supabase_query', platform: 'Supabase', name: 'Run Query', icon: Database, color: '#3ECF8E', description: 'Execute SQL query', fields: [{ key: 'query', label: 'SQL', type: 'textarea' }] },
    { id: 'supabase_insert', platform: 'Supabase', name: 'Insert Row', icon: Database, color: '#3ECF8E', description: 'Insert data into table', fields: [{ key: 'table', label: 'Table', type: 'text' }, { key: 'data', label: 'Data (JSON)', type: 'textarea' }] },
    { id: 'supabase_select', platform: 'Supabase', name: 'Select Rows', icon: Database, color: '#3ECF8E', description: 'Select rows', fields: [{ key: 'table', label: 'Table', type: 'text' }, { key: 'filter', label: 'Filter (JSON)', type: 'textarea' }] },
    { id: 'supabase_update', platform: 'Supabase', name: 'Update Rows', icon: Database, color: '#3ECF8E', description: 'Update rows', fields: [{ key: 'table', label: 'Table', type: 'text' }, { key: 'data', label: 'Data (JSON)', type: 'textarea' }, { key: 'filter', label: 'Filter (JSON)', type: 'textarea' }] },
    { id: 'supabase_delete', platform: 'Supabase', name: 'Delete Rows', icon: Database, color: '#3ECF8E', description: 'Delete rows', fields: [{ key: 'table', label: 'Table', type: 'text' }, { key: 'filter', label: 'Filter (JSON)', type: 'textarea' }] },

    // --- MySQL ---
    { id: 'mysql_query', platform: 'MySQL', name: 'Run Query', icon: Database, color: '#4479A1', description: 'Execute SQL query', fields: [{ key: 'query', label: 'SQL', type: 'textarea' }] },

    // --- Redis ---
    { id: 'redis_set', platform: 'Redis', name: 'Set Key', icon: Database, color: '#DC382D', description: 'Set key', fields: [{ key: 'key', label: 'Key', type: 'text' }, { key: 'value', label: 'Value', type: 'text' }] },
    { id: 'redis_get', platform: 'Redis', name: 'Get Key', icon: Database, color: '#DC382D', description: 'Get key', fields: [{ key: 'key', label: 'Key', type: 'text' }] },
    { id: 'redis_delete', platform: 'Redis', name: 'Delete Key', icon: Database, color: '#DC382D', description: 'Delete key', fields: [{ key: 'key', label: 'Key', type: 'text' }] },

    // --- Amazon S3 ---
    { id: 's3_upload_file', platform: 'Amazon S3', name: 'Upload File', icon: Cloud, color: '#FF9900', description: 'Upload file', fields: [{ key: 'bucket', label: 'Bucket', type: 'text' }, { key: 'key', label: 'Key', type: 'text' }, { key: 'file_url', label: 'File URL', type: 'text' }] },
    { id: 's3_download_file', platform: 'Amazon S3', name: 'Download File', icon: Cloud, color: '#FF9900', description: 'Download file', fields: [{ key: 'bucket', label: 'Bucket', type: 'text' }, { key: 'key', label: 'Key', type: 'text' }] },
    { id: 's3_delete_object', platform: 'Amazon S3', name: 'Delete Object', icon: Cloud, color: '#FF9900', description: 'Delete object', fields: [{ key: 'bucket', label: 'Bucket', type: 'text' }, { key: 'key', label: 'Key', type: 'text' }] },
    { id: 's3_list_objects', platform: 'Amazon S3', name: 'List Objects', icon: Cloud, color: '#FF9900', description: 'List objects', fields: [{ key: 'bucket', label: 'Bucket', type: 'text' }, { key: 'prefix', label: 'Prefix', type: 'text' }] },

    // --- Stripe ---
    { id: 'stripe_list_customers', platform: 'Stripe', name: 'List Customers', icon: CreditCard, color: '#008CDD', description: 'List customers', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'stripe_create_customer', platform: 'Stripe', name: 'Create Customer', icon: CreditCard, color: '#008CDD', description: 'Create customer', fields: [{ key: 'email', label: 'Email', type: 'text' }] },
    { id: 'stripe_list_payments', platform: 'Stripe', name: 'List Payments', icon: CreditCard, color: '#008CDD', description: 'List payments', fields: [{ key: 'limit', label: 'Limit', type: 'number' }] },
    { id: 'stripe_create_invoice', platform: 'Stripe', name: 'Create Invoice', icon: CreditCard, color: '#008CDD', description: 'Create invoice', fields: [{ key: 'customer', label: 'Customer ID', type: 'text' }] },
    { id: 'stripe_finalize_invoice', platform: 'Stripe', name: 'Finalize Invoice', icon: CreditCard, color: '#008CDD', description: 'Finalize invoice', fields: [{ key: 'invoice_id', label: 'Invoice ID', type: 'text' }] },

    // --- Existing / Misc ---
    { id: 'vercel_deploy', platform: 'Vercel', name: 'Deploy Project', icon: Globe, color: '#000000', description: 'Deploy', fields: [{ key: 'project', label: 'Project Name', type: 'text' }] },
    { id: 'vercel_list_projects', platform: 'Vercel', name: 'List Projects', icon: Globe, color: '#000000', description: 'List projects', fields: [] },
    { id: 'docker_list_containers', platform: 'Docker', name: 'List Containers', icon: Container, color: '#2496ED', description: 'List containers', fields: [] },
    { id: 'docker_container_action', platform: 'Docker', name: 'Container Action', icon: Terminal, color: '#2496ED', description: 'Container control', fields: [{ key: 'container_id', label: 'Container ID', type: 'text' }, { key: 'action', label: 'Action', type: 'select', options: ['start', 'stop', 'restart', 'kill'] }] },
    { id: 'http_request', platform: 'Generic', name: 'HTTP Request', icon: Globe, color: '#22c55e', description: 'HTTP request', fields: [{ key: 'url', label: 'URL', type: 'text' }, { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }, { key: 'headers', label: 'Headers (JSON)', type: 'textarea' }, { key: 'body', label: 'Body (JSON)', type: 'textarea' }] },
    { id: 'script_run', platform: 'System', name: 'Run Script', icon: Terminal, color: '#f59e0b', description: 'Execute script', fields: [{ key: 'code', label: 'Code', type: 'textarea' }] }
];

export const getAction = (id: string): ActionDefinition | undefined => {
    return SUPPORTED_ACTIONS.find(i => i.id === id);
};

// Also export platform icons map for easy lookup if needed in other components
export const PLATFORM_ICONS: Record<string, any> = {
    'Google Calendar': Calendar,
    'Gmail': Mail,
    'Slack': Slack,
    'Notion': FileText,
    'Instagram': Instagram,
    'X (Twitter)': Twitter,
    'LinkedIn': Linkedin,
    'YouTube': Youtube,
    'WhatsApp': MessageCircle, // Proxy
    'Google Chat': MessageSquare, // Proxy
    'Reddit': MessageCircle, // Proxy
    'Google Docs': FileText,
    'Google Sheets': Sheet,
    'Airtable': Table, // Proxy
    'Todoist': CheckSquare, // Proxy
    'GitHub': Github,
    'Supabase': Database,
    'MySQL': Database,
    'Redis': Database,
    'Amazon S3': Cloud,
    'Stripe': CreditCard,
    'Vercel': Globe,
    'Docker': Container,
    'Google Drive': Cloud,
    'Trello': Trello,
    'Jira': Table, // Proxy
    'Asana': CheckSquare,
    'Zoom': Video,
    'Twilio': Phone,
    'PagerDuty': AlertTriangle,
    'Generic': Globe,
    'System': Terminal,
    'Excel': Table
};
