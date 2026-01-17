
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface CredentialsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    platform: string;
}

// Define the shape of a credential field
interface CredentialField {
    key: string;
    label: string;
    type: 'text' | 'password' | 'textarea';
    placeholder?: string;
}

// Define schemas for platforms that need multiple fields
export const CREDENTIAL_SCHEMAS: Record<string, CredentialField[]> = {
    'AWS Cloud': [
        { key: 'accessKeyId', label: 'Access Key ID', type: 'text', placeholder: 'AKIA...' },
        { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', placeholder: 'Existing keys are hidden' },
        { key: 'region', label: 'Region', type: 'text', placeholder: 'us-east-1' }
    ],
    'Supabase': [
        { key: 'url', label: 'Project URL', type: 'text', placeholder: 'https://xyz.supabase.co' },
        { key: 'serviceRoleKey', label: 'Service Role Key (secret)', type: 'password', placeholder: 'eyJh...' }
    ],
    'Stripe': [
        { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_test_...' },
        { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_test_...' }
    ],
    'Google Cloud': [
        { key: 'serviceAccountJson', label: 'Service Account JSON', type: 'textarea', placeholder: '{ "type": "service_account", ... }' }
    ],
    'Docker': [
        { key: 'username', label: 'Username', type: 'text' },
        { key: 'token', label: 'Access Token / Password', type: 'password' }
    ],
    'Kubernetes': [
        { key: 'kubeconfig', label: 'Kubeconfig (YAML)', type: 'textarea', placeholder: 'apiVersion: v1...' }
    ],
    'Twilio': [
        { key: 'accountSid', label: 'Account SID', type: 'text' },
        { key: 'authToken', label: 'Auth Token', type: 'password' },
        { key: 'fromNumber', label: 'From Number', type: 'text', placeholder: '+1234567890' }
    ]
};

// Simple single-key mappings for backward compatibility or simple APIs
export const CREDENTIAL_KEYS: Record<string, string> = {
    'Slack': 'SLACK_BOT_TOKEN',
    'Notion': 'NOTION_API_KEY',
    'Google Calendar': 'GOOGLE_ACCESS_TOKEN',
    'Gmail': 'GOOGLE_ACCESS_TOKEN',
};

export const CredentialsDialog = ({ open, onOpenChange, platform }: CredentialsDialogProps) => {
    // State to hold the form values. 
    // For single string keys, we map { default: string } or just use the raw string handling if simple.
    // For schemas, we map { [key]: value }
    const [values, setValues] = useState<Record<string, string>>({});
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

    const schema = CREDENTIAL_SCHEMAS[platform];
    const simpleKey = CREDENTIAL_KEYS[platform] || (!schema ? `KEY_FOR_${platform.toUpperCase()}` : null);
    const storageKey = simpleKey || `CREDENTIALS_${platform.toUpperCase().replace(/\s+/g, '_')}`;

    useEffect(() => {
        if (open) {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                if (simpleKey) {
                    setValues({ default: stored });
                } else {
                    try {
                        setValues(JSON.parse(stored));
                    } catch (e) {
                        // Fallback/reset if invalid JSON
                        setValues({});
                    }
                }
            } else {
                setValues({});
            }
        }
    }, [open, storageKey, simpleKey]);

    const handleChange = (key: string, val: string) => {
        setValues(prev => ({ ...prev, [key]: val }));
    };

    const toggleShow = (key: string) => {
        setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = () => {
        if (simpleKey) {
            const val = values['default'] || '';
            if (val.trim()) {
                localStorage.setItem(storageKey, val.trim());
            } else {
                localStorage.removeItem(storageKey);
            }
        } else {
            // Check if object is empty or all values are empty strings
            const hasData = Object.values(values).some(v => v.trim());
            if (hasData) {
                localStorage.setItem(storageKey, JSON.stringify(values));
            } else {
                localStorage.removeItem(storageKey);
            }
        }
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Configure {platform}</DialogTitle>
                    <DialogDescription>
                        Enter credentials to enable execution for {platform}.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                    {schema ? (
                        // Render schema fields
                        schema.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label htmlFor={field.key}>{field.label}</Label>
                                <div className="relative">
                                    {field.type === 'textarea' ? (
                                        <Textarea
                                            id={field.key}
                                            placeholder={field.placeholder}
                                            value={values[field.key] || ''}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="min-h-[100px] font-mono text-xs"
                                        />
                                    ) : (
                                        <>
                                            <Input
                                                id={field.key}
                                                type={field.type === 'password' && !showPassword[field.key] ? "password" : "text"}
                                                placeholder={field.placeholder}
                                                value={values[field.key] || ''}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                className={field.type === 'password' ? "pr-10" : ""}
                                            />
                                            {field.type === 'password' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                    onClick={() => toggleShow(field.key)}
                                                >
                                                    {showPassword[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </Button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        // Default single key input
                        <div className="space-y-2">
                            <Label htmlFor="defaultApiKey">API Key / Token</Label>
                            <div className="relative">
                                <Input
                                    id="defaultApiKey"
                                    type={showPassword['default'] ? "text" : "password"}
                                    placeholder={`Enter ${storageKey}...`}
                                    value={values['default'] || ''}
                                    onChange={(e) => handleChange('default', e.target.value)}
                                    className="pr-10"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                    onClick={() => toggleShow('default')}
                                >
                                    {showPassword['default'] ? <EyeOff size={14} /> : <Eye size={14} />}
                                </Button>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                        <Lock size={10} /> Stored securely in your browser's LocalStorage
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Credentials</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
