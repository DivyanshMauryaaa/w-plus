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
    Zap
} from 'lucide-react';

export type IntegrationType =
    | 'google_calendar'
    | 'vercel'
    | 'docker'
    | 'kubernetes'
    | 'gmail'
    | 'notion'
    | 'slack'
    | 'linkedin'
    | 'google_docs'
    | 'github'
    | 'generic_request'
    | 'generic_action';

export interface IntegrationField {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'select';
    options?: string[];
    placeholder?: string;
}

export interface Integration {
    id: IntegrationType;
    name: string;
    icon: any;
    color: string;
    description: string;
    isConnected: boolean; // Mock status
    fields: IntegrationField[];
}

export const SUPPORTED_INTEGRATIONS: Integration[] = [
    {
        id: 'google_calendar',
        name: 'Google Calendar',
        icon: Calendar,
        color: '#4285F4',
        description: 'Manage events and schedules',
        isConnected: true,
        fields: [
            { key: 'summary', label: 'Event Title', type: 'text', placeholder: 'Meeting with...' },
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Details about the event' },
            { key: 'start_time', label: 'Start Time', type: 'text', placeholder: '2024-01-01T10:00:00Z' },
            { key: 'attendees', label: 'Attendees (Emails)', type: 'text', placeholder: 'a@b.com, c@d.com' }
        ]
    },
    {
        id: 'vercel',
        name: 'Vercel',
        icon: Globe,
        color: '#000000',
        description: 'Deploy and manage projects',
        isConnected: true,
        fields: [
            { key: 'project_name', label: 'Project Name', type: 'text' },
            { key: 'command', label: 'Command', type: 'select', options: ['deploy', 'redeploy', 'rollback'] }
        ]
    },
    {
        id: 'docker',
        name: 'Docker',
        icon: Container,
        color: '#2496ED',
        description: 'Manage containers and images',
        isConnected: false,
        fields: [
            { key: 'image', label: 'Image Name', type: 'text' },
            { key: 'container_name', label: 'Container Name', type: 'text' },
            { key: 'action', label: 'Action', type: 'select', options: ['start', 'stop', 'restart', 'logs'] }
        ]
    },
    {
        id: 'kubernetes',
        name: 'Kubernetes',
        icon: Box,
        color: '#326CE5',
        description: 'Orchestrate container clusters',
        isConnected: false,
        fields: [
            { key: 'deployment', label: 'Deployment Name', type: 'text' },
            { key: 'namespace', label: 'Namespace', type: 'text', placeholder: 'default' },
            { key: 'replicas', label: 'Replicas', type: 'text' }
        ]
    },
    {
        id: 'gmail',
        name: 'Gmail',
        icon: Mail,
        color: '#EA4335',
        description: 'Send and receive emails',
        isConnected: true,
        fields: [
            { key: 'to', label: 'To', type: 'text', placeholder: 'recipient@example.com' },
            { key: 'subject', label: 'Subject', type: 'text' },
            { key: 'body', label: 'Body', type: 'textarea' }
        ]
    },
    {
        id: 'notion',
        name: 'Notion',
        icon: FileText,
        color: '#000000',
        description: 'Manage pages and databases',
        isConnected: true,
        fields: [
            { key: 'page_id', label: 'Page/Database ID', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'content', label: 'Content (Markdown)', type: 'textarea' }
        ]
    },
    {
        id: 'slack',
        name: 'Slack',
        icon: Slack,
        color: '#4A154B',
        description: 'Send messages and alerts',
        isConnected: true,
        fields: [
            { key: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
            { key: 'message', label: 'Message', type: 'textarea' }
        ]
    },
    {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: Linkedin,
        color: '#0A66C2',
        description: 'Post updates and manage profile',
        isConnected: true,
        fields: [
            { key: 'content', label: 'Post Content', type: 'textarea' },
            { key: 'visibility', label: 'Visibility', type: 'select', options: ['public', 'connections', 'private'] }
        ]
    },
    {
        id: 'google_docs',
        name: 'Google Docs',
        icon: FileText,
        color: '#4285F4',
        description: 'Create and edit documents',
        isConnected: true,
        fields: [
            { key: 'title', label: 'Document Title', type: 'text' },
            { key: 'content', label: 'Content', type: 'textarea' }
        ]
    },
    {
        id: 'github',
        name: 'GitHub',
        icon: Github,
        color: '#181717',
        description: 'Manage repositories and issues',
        isConnected: true,
        fields: [
            { key: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' },
            { key: 'action', label: 'Action', type: 'select', options: ['create_issue', 'create_pr', 'comment', 'merge'] },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'body', label: 'Body', type: 'textarea' }
        ]
    },
    {
        id: 'generic_request',
        name: 'HTTP Request',
        icon: Globe,
        color: '#22c55e',
        description: 'Make a generic HTTP request',
        isConnected: true,
        fields: [
            { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com' },
            { key: 'method', label: 'Method', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'] },
            { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer..."}' },
            { key: 'body', label: 'Body (JSON)', type: 'textarea' }
        ]
    },
    {
        id: 'generic_action',
        name: 'Action',
        icon: Zap,
        color: '#f59e0b',
        description: 'Execute a script or action',
        isConnected: true,
        fields: [
            { key: 'instruction', label: 'Instruction', type: 'textarea', placeholder: 'Describe what to do...' }
        ]
    }
];

export const getIntegration = (id: string): Integration | undefined => {
    return SUPPORTED_INTEGRATIONS.find(i => i.id === id);
};
