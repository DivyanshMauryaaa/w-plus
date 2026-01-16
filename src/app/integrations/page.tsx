
'use client';

import React, { useState, useEffect } from 'react';
import { ConnectionsManager } from '@/components/workflow/ConnectionsManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function IntegrationsPage() {
    // We can fetch connected IDs here if we want to pass them down, 
    // but ConnectionsManager mostly manages its own state or expects props.
    // For now, we'll strip the "connectedIds" prop requirement from ConnectionsManager 
    // or provide a dummy one since ConnectionsManager fetches status internally anyway for the badges.
    // Wait, ConnectionsManager takes `connectedIds` (from Supabase flow or local storage flow).
    // Let's verify ConnectionsManager signature.

    const [connectedIds, setConnectedIds] = useState<any[]>([]);

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 hover:bg-accent rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your connected accounts and API credentials.
                        </p>
                    </div>
                </div>

                <ConnectionsManager
                    connectedIds={connectedIds}
                    onToggle={(id) => console.log('Toggle', id)}
                />
            </div>
        </div>
    );
}
