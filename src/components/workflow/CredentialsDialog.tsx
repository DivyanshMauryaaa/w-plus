
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface CredentialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    platform: string;
}

export const CREDENTIAL_KEYS: Record<string, string> = {
    'Slack': 'SLACK_BOT_TOKEN',
    'Notion': 'NOTION_API_KEY',
    'Google Calendar': 'GOOGLE_ACCESS_TOKEN',
    'Gmail': 'GOOGLE_ACCESS_TOKEN',
    // Map other platforms that share keys or have unique ones
};

export const CredentialsDialog = ({ open, onOpenChange, platform }: CredentialsDialogProps) => {
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);

    // Determine which env var key maps to this platform
    // Note: Google services share the same token for this simple implementation
    const storageKey = CREDENTIAL_KEYS[platform] || `KEY_FOR_${platform.toUpperCase()}`;

    useEffect(() => {
        if (open) {
            // Load existing key from localStorage
            const existing = localStorage.getItem(storageKey);
            if (existing) setKey(existing);
        }
    }, [open, storageKey]);

    const handleSave = () => {
        if (key.trim()) {
            localStorage.setItem(storageKey, key.trim());
        } else {
            localStorage.removeItem(storageKey);
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Configure {platform}</DialogTitle>
                    <DialogDescription>
                        Enter your API credentials to enable real execution for {platform}.
                        These are stored locally in your browser.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="apiKey">API Key / Token</Label>
                        <div className="relative">
                            <Input
                                id="apiKey"
                                type={showKey ? "text" : "password"}
                                placeholder={`Enter ${storageKey}...`}
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="pr-10"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowKey(!showKey)}
                            >
                                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Lock size={10} /> Stored securely in your browser's LocalStorage
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Credentials</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
