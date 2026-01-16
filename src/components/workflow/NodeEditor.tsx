import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ActionType, getAction } from '@/lib/integrations';
import { Wand2 } from 'lucide-react';

interface NodeData {
    id: string;
    label: string;
    description: string;
    status: string;
    actionId?: ActionType; // Renamed from integrationId
    config?: {
        prompt?: string;
        // Legacy: key: value
        // New: key: { mode: 'manual' | 'ai', value: string }
        [key: string]: any;
    };
}

interface NodeEditorProps {
    nodeId: string | null;
    initialData: NodeData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (nodeId: string, updates: Partial<NodeData>) => void;
}

export const NodeEditor = ({ nodeId, initialData, open, onOpenChange, onSave }: NodeEditorProps) => {
    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [config, setConfig] = useState<any>({});

    useEffect(() => {
        if (initialData && open) {
            setLabel(initialData.label || '');
            setDescription(initialData.description || '');

            // Normalize config to new structure if needed
            const rawConfig = initialData.config || {};
            const normalizedConfig: any = {};

            Object.keys(rawConfig).forEach(key => {
                const val = rawConfig[key];
                if (typeof val === 'object' && val !== null && 'mode' in val) {
                    normalizedConfig[key] = val; // Already new format
                } else if (key !== 'prompt') {
                    normalizedConfig[key] = { mode: 'manual', value: val }; // Convert legacy
                } else {
                    normalizedConfig[key] = val; // keep prompt as is (legacy support or text step)
                }
            });

            setConfig(normalizedConfig);
        }
    }, [initialData, open]);

    const handleSave = () => {
        if (!nodeId) return;

        onSave(nodeId, {
            label,
            description,
            config: config
        });
        onOpenChange(false);
    };

    const updateConfig = (key: string, field: 'mode' | 'value', val: string) => {
        setConfig((prev: any) => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: val
            }
        }));
    };

    // Use getAction instead of getIntegration
    // Fallback: check integrationId for backward compatibility during dev, though user said "right now", so we can assume we're migrating.
    const actionId = initialData?.actionId || (initialData as any)?.integrationId;
    const action = actionId ? getAction(actionId) : null;

    // Fallback fields for generic nodes or if no schema
    const fields = action?.fields || [];

    // Helper to get current field state safely
    const getFieldState = (key: string) => {
        return config[key] || { mode: 'manual', value: '' };
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Edit Workflow Step</SheetTitle>
                    <SheetDescription>
                        Customize how this {action?.name || 'step'} executes.
                    </SheetDescription>
                </SheetHeader>

                <div className="grid gap-6 py-6">
                    {action && (
                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
                            <div className="p-2 rounded bg-background border">
                                <action.icon size={20} style={{ color: action.color }} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold leading-none">{action.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">Platform: {action.platform}</span>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="label">Step Name</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Render Fields based on Schema */}
                    {fields.length > 0 ? (
                        <div className="space-y-4 border-t pt-4">
                            <h4 className="font-medium text-sm text-foreground">Action Configuration</h4>
                            {fields.map((field) => {
                                const state = getFieldState(field.key);

                                return (
                                    <div key={field.key} className="grid gap-2 p-3 border rounded-md">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-semibold">{field.label}</Label>
                                            <Tabs
                                                value={state.mode}
                                                onValueChange={(v) => updateConfig(field.key, 'mode', v)}
                                                className="w-[140px]"
                                            >
                                                <TabsList className="grid w-full grid-cols-2 h-7">
                                                    <TabsTrigger value="manual" className="text-xs px-1">Manual</TabsTrigger>
                                                    <TabsTrigger value="ai" className="text-xs px-1">AI Gen</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>

                                        {state.mode === 'manual' ? (
                                            <>
                                                {field.type === 'textarea' ? (
                                                    <Textarea
                                                        placeholder={field.placeholder}
                                                        value={state.value}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateConfig(field.key, 'value', e.target.value)}
                                                        className="min-h-[80px]"
                                                    />
                                                ) : field.type === 'select' ? (
                                                    <Select
                                                        value={state.value}
                                                        onValueChange={(val: string) => updateConfig(field.key, 'value', val)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {field.options?.map((opt) => (
                                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        placeholder={field.placeholder}
                                                        value={state.value}
                                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateConfig(field.key, 'value', e.target.value)}
                                                    />
                                                )}
                                                <p className="text-[10px] text-muted-foreground">
                                                    Static value used every time.
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="relative">
                                                    <Wand2 className="absolute top-2.5 left-2.5 h-4 w-4 text-purple-500" />
                                                    <Textarea
                                                        value={state.value}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateConfig(field.key, 'value', e.target.value)}
                                                        className="pl-9 min-h-[80px] border-purple-200 focus-visible:ring-purple-500"
                                                        placeholder={`Prompt for AI: e.g. "Extract the ${field.label.toLowerCase()} from the email body..."`}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-purple-600/80">
                                                    AI will generate this value at runtime based on your prompt and previous steps.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Fallback for generic nodes without explicit fields
                        <div className="grid gap-2 border-t pt-4">
                            <Label htmlFor="prompt">
                                Action Prompt
                                <span className="text-xs text-muted-foreground ml-2 font-normal">
                                    (Legacy Generic Mode)
                                </span>
                            </Label>
                            <Textarea
                                id="prompt"
                                value={config.prompt || ''}
                                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                                className="min-h-[150px] font-mono text-sm"
                            />
                        </div>
                    )}
                </div>

                <SheetFooter className="pb-6">
                    <Button type="submit" onClick={handleSave} className="w-full">Save Changes</Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};
