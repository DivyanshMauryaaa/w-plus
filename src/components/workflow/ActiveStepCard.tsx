import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

interface ActiveStepCardProps {
    data: {
        id: string;
        label: string;
        description: string;
        status: 'pending' | 'active' | 'completed';
    };
    onRun: (id: string, label: string) => void;
}

export const ActiveStepCard = ({ data, onRun }: ActiveStepCardProps) => {
    return (
        <Card className="w-full max-w-full border-2 border-primary shadow-lg ring-4 ring-primary/10 animate-in fade-in slide-in-from-bottom-4 mb-4 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Badge>Running</Badge>
                        {data.label}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <p className="text-sm text-muted-foreground mb-4">
                    {data.description}
                </p>

                <Button
                    size="lg"
                    className="w-full gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                    onClick={() => onRun(data.id, data.label)}
                >
                    <Play size={16} className="fill-current" />
                    RUN STEP
                </Button>
            </CardContent>
        </Card>
    );
};
