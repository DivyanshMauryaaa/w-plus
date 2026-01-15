import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, MoreHorizontal, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIntegration, IntegrationType } from '@/lib/integrations';

interface CustomNodeProps {
    data: {
        label: string;
        description: string;
        status: 'pending' | 'active' | 'completed' | 'failed';
        integrationId?: IntegrationType; // New field to identify the integration
        config?: any;
        onRun?: () => void;
        onEdit?: () => void; // New handler for editing
    };
    selected?: boolean; // ReactFlow passes this
}

export const CustomNode = memo(({ data, selected }: CustomNodeProps) => {
    const isCompleted = data.status === 'completed';
    const isActive = data.status === 'active';
    const isFailed = data.status === 'failed';

    // Get integration details or fallback
    const integration = data.integrationId ? getIntegration(data.integrationId) : null;
    const Icon = integration?.icon || Settings;
    const color = integration?.color || '#64748b';

    return (
        <Card className={cn(
            "min-w-[200px] max-w-[250px] shadow-sm transition-all duration-300 relative group overflow-visible",
            // Selection state
            selected ? "ring-2 ring-primary border-primary" : "border-border",
            // Status states
            isActive ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "",
            isCompleted ? "border-green-500/50 bg-green-50/10" : "",
            isFailed ? "border-red-500/50 bg-red-50/10" : "",
            "bg-card"
        )}>
            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className={cn(
                    "!w-3 !h-3 !-left-[6px] transition-colors",
                    selected ? "!bg-primary" : "!bg-muted-foreground"
                )}
            />

            <div className="p-3 flex items-center gap-3">
                {/* Icon Box */}
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                    style={{
                        backgroundColor: `${color}15`, // 10% opacity
                        color: color
                    }}
                >
                    <Icon size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-xs font-semibold truncate pr-2">
                            {integration?.name || 'Action'}
                        </p>
                        {/* Status Indicator */}
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            isActive ? "bg-primary animate-pulse" :
                                isCompleted ? "bg-green-500" :
                                    isFailed ? "bg-red-500" : "bg-muted-foreground/30"
                        )} />
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate" title={data.label}>
                        {data.label}
                    </p>
                </div>

                {/* Actions */}
                <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-6 w-6 rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground"
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent node selection
                            data.onEdit?.();
                        }}
                    >
                        <MoreHorizontal size={12} />
                    </Button>
                </div>
            </div>

            {/* Output Handle */}
            <Handle
                type="source"
                position={Position.Right}
                className={cn(
                    "!w-3 !h-3 !-right-[6px] transition-colors",
                    selected ? "!bg-primary" : "!bg-muted-foreground"
                )}
            />
        </Card>
    );
});

CustomNode.displayName = "CustomNode";
