
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUPPORTED_ACTIONS, ActionType } from '@/lib/integrations';
import { Check, Plus, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { CredentialsDialog, CREDENTIAL_KEYS, CREDENTIAL_SCHEMAS } from './CredentialsDialog';
import { useConnectedPlatforms } from '@/hooks/useConnectedPlatforms';

interface ConnectionsManagerProps {
    connectedIds: ActionType[];
    onToggle: (id: ActionType) => void;
    showOnlyConnected?: boolean;
}

export const ConnectionsManager = ({ connectedIds, onToggle, showOnlyConnected = false }: ConnectionsManagerProps) => {
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    // Track which platforms have keys in local storage OR oauth in DB
    const { configuredPlatforms, checkConfig } = useConnectedPlatforms();

    // Platforms that support OAuth flow
    const OAUTH_PROVIDERS = [
        'Google', 'Slack', 'Notion', 'X (Twitter)', 'Instagram', 'LinkedIn',
        'PubMed', 'YouTube', 'GitHub', 'Vercel', 'Trello', 'Excel', 'WhatsApp'
    ];

    // State for accordion
    const [isExpanded, setIsExpanded] = useState(false);

    // Also re-check when we close the dialog
    const handleDialogChange = (open: boolean) => {
        if (!open) {
            setSelectedPlatform(null);
            checkConfig();
        }
    };

    const handleConnectClick = (platform: string) => {
        // If OAuth supported, redirect
        // Normalize platform name to provider ID
        let pid = platform.toLowerCase();

        // Mappings
        if (pid.includes('google') || pid.includes('gmail')) pid = 'google';
        else if (pid.includes('twitter') || pid === 'x (twitter)') pid = 'x';
        else if (pid.includes('linkedin')) pid = 'linkedin';
        else if (pid.includes('instagram')) pid = 'instagram';
        else if (pid.includes('github')) pid = 'github';
        else if (pid.includes('youtube')) pid = 'youtube';
        else if (pid.includes('slack')) pid = 'slack';
        else if (pid.includes('notion')) pid = 'notion';

        // New Mappings
        else if (pid.includes('vercel')) pid = 'vercel';
        else if (pid.includes('trello')) pid = 'trello';
        else if (pid.includes('excel')) pid = 'microsoft';
        else if (pid.includes('whatsapp') && OAUTH_PROVIDERS.includes('WhatsApp')) pid = 'meta';

        // Trello, Vercel, Excel, WhatsApp are in OAUTH_PROVIDERS.
        const isOauth = OAUTH_PROVIDERS.some(p => platform.includes(p) || p.toLowerCase() === pid);

        if (isOauth && !platform.includes('Generic')) {
            // Redirect to OAuth login
            window.location.href = `/api/integrations/auth/login?provider=${pid}`;
            return;
        }

        // Fallback to manual dialog
        setSelectedPlatform(platform);
    };

    // 1. Group actions by platform
    let platforms = Array.from(new Set(SUPPORTED_ACTIONS.map(a => a.platform))).sort();

    // Filter if showOnlyConnected
    if (showOnlyConnected) {
        platforms = platforms.filter(p => {
            // Check if connected based on connectedIds (actions enabled) or configuredPlatforms (auth present)
            // Usually configuredPlatforms is the source of truth for "Account Connected".
            // connectedIds tracks "Action Enabled".
            // We want to show platforms that are "Configured" (Logged in).
            return configuredPlatforms[p];
        });
    }

    const handlePlatformToggle = (platform: string) => {
        const platformActions = SUPPORTED_ACTIONS.filter(a => a.platform === platform);
        const allConnected = platformActions.every(a => connectedIds.includes(a.id));

        // If we are trying to ENABLE (not disable), check if configured
        if (!allConnected) {
            const needsConfig = CREDENTIAL_KEYS.hasOwnProperty(platform) || CREDENTIAL_SCHEMAS.hasOwnProperty(platform) || OAUTH_PROVIDERS.some(p => platform.includes(p));
            // Since configuredPlatforms is state, we can use it
            const isConfigured = !needsConfig || configuredPlatforms[platform];

            if (needsConfig && !isConfigured) {
                handleConnectClick(platform);
                return;
            }
        }

        platformActions.forEach(action => {
            if (allConnected) {
                if (connectedIds.includes(action.id)) onToggle(action.id);
            } else {
                if (!connectedIds.includes(action.id)) onToggle(action.id);
            }
        });
    };

    // Count generic connected platforms for badge
    const connectedPlatformCount = platforms.filter(platform => {
        const platformActions = SUPPORTED_ACTIONS.filter(a => a.platform === platform);
        return platformActions.filter(a => connectedIds.includes(a.id)).length > 0;
    }).length;

    return (
        <>
            <Card className="w-full transition-all duration-300">
                <CardHeader
                    className="pb-3 cursor-pointer hover:bg-accent/50 transition-colors py-3"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-sm font-medium">Connected Platforms</CardTitle>
                            {!isExpanded && connectedPlatformCount > 0 && (
                                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                    {connectedPlatformCount}
                                </span>
                            )}
                        </div>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                    {isExpanded && (
                        <CardDescription className="text-xs pt-1">
                            Connect apps to enable their actions for your AI agent.
                        </CardDescription>
                    )}
                </CardHeader>

                {isExpanded && (
                    <CardContent className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 pt-0 pb-3">
                        {platforms.map((platform) => {
                            const platformActions = SUPPORTED_ACTIONS.filter(a => a.platform === platform);
                            const representative = platformActions[0];
                            const Icon = representative.icon;

                            const connectedCount = platformActions.filter(a => connectedIds.includes(a.id)).length;
                            const isFullyConnected = connectedCount === platformActions.length;
                            const isPartiallyConnected = connectedCount > 0 && !isFullyConnected;

                            const needsConfig = CREDENTIAL_KEYS.hasOwnProperty(platform) || CREDENTIAL_SCHEMAS.hasOwnProperty(platform) || OAUTH_PROVIDERS.some(p => platform.includes(p));
                            const isConfigured = !needsConfig || configuredPlatforms[platform];

                            return (
                                <div
                                    key={platform}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isFullyConnected
                                        ? 'bg-primary/5 border-primary/20'
                                        : 'bg-card border-border hover:bg-accent/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                                            style={{
                                                backgroundColor: isFullyConnected || isPartiallyConnected ? `${representative.color}20` : '#f4f4f5',
                                                color: isFullyConnected || isPartiallyConnected ? representative.color : '#71717a'
                                            }}
                                        >
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold">{platform}</p>
                                                {needsConfig && !isConfigured && isPartiallyConnected && (
                                                    <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                                                        Login Required
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{platformActions.length} Action{platformActions.length !== 1 ? 's' : ''}</span>
                                                {needsConfig && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); isConfigured ? setSelectedPlatform(platform) : handleConnectClick(platform); }}
                                                        className="hover:text-primary underline flex items-center gap-1"
                                                    >
                                                        <Settings size={10} />
                                                        {isConfigured ? 'Configure' : 'Connect'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant={isFullyConnected ? "secondary" : "outline"}
                                        className={isFullyConnected ? "text-green-600 bg-green-50 hover:bg-green-100 h-8 px-3" : "h-8 px-3"}
                                        onClick={() => handlePlatformToggle(platform)}
                                    >
                                        {isFullyConnected ? (
                                            <div className="flex items-center gap-1.5">
                                                <Check size={14} />
                                                <span className="text-xs">Active</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <Plus size={14} />
                                                <span className="text-xs">Enable</span>
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                )}
            </Card>

            {selectedPlatform && (
                <CredentialsDialog
                    open={!!selectedPlatform}
                    onOpenChange={handleDialogChange}
                    platform={selectedPlatform}
                />
            )}
        </>
    );
};
