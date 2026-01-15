import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SUPPORTED_INTEGRATIONS, IntegrationType } from '@/lib/integrations';
import { Check, Plus, Trash2, X } from 'lucide-react';

interface ConnectionsManagerProps {
    connectedIds: IntegrationType[];
    onToggle: (id: IntegrationType) => void;
}

export const ConnectionsManager = ({ connectedIds, onToggle }: ConnectionsManagerProps) => {
    return (
        <Card className="w-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">Connected Apps</CardTitle>
                <CardDescription>
                    Manage the services your AI agent can access.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2">
                {SUPPORTED_INTEGRATIONS.map((integration) => {
                    const isConnected = connectedIds.includes(integration.id);
                    const Icon = integration.icon;

                    return (
                        <div
                            key={integration.id}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isConnected
                                    ? 'bg-primary/5 border-primary/20'
                                    : 'bg-card border-border hover:bg-accent/50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                                    style={{
                                        backgroundColor: isConnected ? `${integration.color}20` : '#f4f4f5',
                                        color: isConnected ? integration.color : '#71717a'
                                    }}
                                >
                                    <Icon size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{integration.name}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                        {integration.description}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant={isConnected ? "secondary" : "outline"}
                                className={isConnected ? "text-green-600 bg-green-50 hover:bg-green-100" : ""}
                                onClick={() => onToggle(integration.id)}
                            >
                                {isConnected ? (
                                    <>
                                        <Check size={14} className="mr-1" /> Connected
                                    </>
                                ) : (
                                    <>
                                        <Plus size={14} className="mr-1" /> Connect
                                    </>
                                )}
                            </Button>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
