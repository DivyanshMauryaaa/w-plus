import React from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomNodeProps {
    data: {
        label: string;
        description: string;
        status: 'pending' | 'active' | 'completed';
        onRun?: () => void;
    };
}

export const CustomNode = ({ data }: CustomNodeProps) => {
    const isCompleted = data.status === 'completed';
    const isActive = data.status === 'active';

    return (
        <Card className={cn(
            "w-[300px] border-2 shadow-sm transition-all duration-300",
            isActive ? "border-primary shadow-md ring-2 ring-primary/20" : "border-muted",
            isCompleted ? "bg-muted/50 border-green-500/50" : "bg-card"
        )}>
            <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />

            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium leading-none">
                        {data.label}
                    </CardTitle>
                    <div className="text-xs">
                        {isCompleted && <CheckCircle size={16} className="text-green-500" />}
                        {isActive && <div className="animate-pulse w-3 h-3 rounded-full bg-primary" />}
                        {!isActive && !isCompleted && <Clock size={16} className="text-muted-foreground" />}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground mb-4">
                    {data.description}
                </p>

                {isActive && (
                    <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={data.onRun}
                    >
                        <Play size={14} /> Run Step
                    </Button>
                )}

                {isCompleted && (
                    <div className="w-full text-center text-xs text-green-600 font-medium py-2 bg-green-500/10 rounded">
                        Completed
                    </div>
                )}
            </CardContent>

            <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
        </Card>
    );
};
