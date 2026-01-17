import { useState, useEffect } from 'react';
import { CREDENTIAL_KEYS, CREDENTIAL_SCHEMAS } from '@/components/workflow/CredentialsDialog';

export const useConnectedPlatforms = () => {
    const [configuredPlatforms, setConfiguredPlatforms] = useState<Record<string, boolean>>({});

    const checkConfig = async () => {
        const status: Record<string, boolean> = {};

        // 1. Check Local Storage (Manual Keys)
        Object.keys(CREDENTIAL_SCHEMAS).forEach(p => {
            const key = `CREDENTIALS_${p.toUpperCase().replace(/\s+/g, '_')}`;
            if (localStorage.getItem(key)) status[p] = true;
        });

        Object.keys(CREDENTIAL_KEYS).forEach(platform => {
            const key = CREDENTIAL_KEYS[platform];
            if (localStorage.getItem(key)) status[platform] = true;
        });

        // 2. Check Backend (OAuth)
        try {
            const res = await fetch('/api/integrations/status');
            if (res.ok) {
                const data = await res.json();
                if (data.connections) {
                    const map = data.connections;
                    if (map['google']) {
                        status['Google Calendar'] = true;
                        status['Gmail'] = true;
                        status['Google Drive'] = true;
                        status['Google'] = true;
                    }
                    if (map['slack']) status['Slack'] = true;
                    if (map['notion']) status['Notion'] = true;

                    if (map['x']) status['X (Twitter)'] = true;
                    if (map['instagram']) status['Instagram'] = true;
                    if (map['linkedin']) status['LinkedIn'] = true;
                    if (map['github']) status['GitHub'] = true;
                    if (map['youtube']) status['YouTube'] = true;

                    // New OAuths
                    if (map['vercel']) status['Vercel'] = true;
                    if (map['trello']) status['Trello'] = true;
                    if (map['microsoft']) status['Excel'] = true;
                    if (map['meta']) status['WhatsApp'] = true;
                }
            }
        } catch (e) {
            console.error("Failed to check integration status", e);
        }

        setConfiguredPlatforms(status);
        return status;
    };

    useEffect(() => {
        checkConfig();
        window.addEventListener('storage', checkConfig);
        if (typeof window !== 'undefined' && window.location.search.includes('success=true')) {
            checkConfig();
        }
        return () => window.removeEventListener('storage', checkConfig);
    }, []);

    return { configuredPlatforms, checkConfig };
};
