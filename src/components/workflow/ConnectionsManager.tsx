import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SUPPORTED_ACTIONS, ActionType } from '@/lib/integrations';
import { Check, Plus } from 'lucide-react';

interface ConnectionsManagerProps {
    connectedIds: ActionType[];
    onToggle: (id: ActionType) => void;
}

export const ConnectionsManager = ({ connectedIds, onToggle }: ConnectionsManagerProps) => {
    // 1. Group actions by platform
    const platforms = Array.from(new Set(SUPPORTED_ACTIONS.map(a => a.platform))).sort();

    const handlePlatformToggle = (platform: string) => {
        const platformActions = SUPPORTED_ACTIONS.filter(a => a.platform === platform);
        const allConnected = platformActions.every(a => connectedIds.includes(a.id));

        // If all are connected, we want to disconnect all (toggle each off)
        // If some or none are connected, we want to connect all missing ones
        platformActions.forEach(action => {
            if (allConnected) {
                // If currently connected, toggle it (to disconnect)
                if (connectedIds.includes(action.id)) {
                    onToggle(action.id);
                }
            } else {
                // If not connected, toggle it (to connect)
                if (!connectedIds.includes(action.id)) {
                    onToggle(action.id);
                }
            }
        });
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Connected Platforms</CardTitle>
                <CardDescription>
                    Connect apps to enable their actions for your AI agent.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
                {platforms.map((platform) => {
                    const platformActions = SUPPORTED_ACTIONS.filter(a => a.platform === platform);
                    // We just need one action to grab the icon and color
                    const representative = platformActions[0];
                    const Icon = representative.icon;

                    // Check connection status
                    const connectedCount = platformActions.filter(a => connectedIds.includes(a.id)).length;
                    const isFullyConnected = connectedCount === platformActions.length;
                    const isPartiallyConnected = connectedCount > 0 && !isFullyConnected;

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
                                        {isPartiallyConnected && (
                                            <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">
                                                Partially Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {platformActions.length} Action{platformActions.length !== 1 ? 's' : ''} available
                                    </p>
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
                                        <span className="text-xs">Connected</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5">
                                        <Plus size={14} />
                                        <span className="text-xs">Connect</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
