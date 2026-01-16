
import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '@/lib/executor';
import { ActionType } from '@/lib/integrations';
import { auth } from '@clerk/nextjs/server';

interface WorkflowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
        label: string;
        actionId?: string;
        config?: any;
    };
}

interface WorkflowData {
    nodes: WorkflowNode[];
    edges: any[];
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const workflow = body.workflow as WorkflowData;
        const credentials = body.credentials;
        const { userId } = await auth();

        if (!workflow || !Array.isArray(workflow.nodes)) {
            return NextResponse.json(
                { error: 'Valid workflow object with nodes is required' },
                { status: 400 }
            );
        }

        // 1. Sort nodes by X position to determine execution order
        // This matches the frontend logic in WorkflowBoard.tsx
        const sortedNodes = [...workflow.nodes].sort((a, b) => a.position.x - b.position.x);

        const results: Record<string, any> = {};
        const logs: string[] = [];
        let globalSuccess = true;

        // 2. Execute loop
        for (const node of sortedNodes) {
            const actionId = node.data.actionId;
            // params might be directly in data.config
            const config = node.data.config || {};

            // Basic Context Substitution (Optional but helpful)
            // If we wanted to pass previous results into this config, we'd do it here.
            // For now, we'll just log that we are running it.

            logs.push(`Starting Node ${node.id} (${node.data.label})`);

            if (actionId) {
                try {
                    const result = await executeAction(actionId as ActionType, config, credentials, userId || undefined);

                    results[node.id] = {
                        status: result.success ? 'success' : 'failed',
                        output: result.output,
                        error: result.error,
                        timestamp: new Date().toISOString()
                    };

                    if (!result.success) {
                        globalSuccess = false;
                        logs.push(`Node ${node.id} failed: ${result.error}`);
                        // Optional: Break on failure?
                        // break; 
                    } else {
                        logs.push(`Node ${node.id} completed successfully`);
                    }
                } catch (e: any) {
                    results[node.id] = {
                        status: 'failed',
                        error: e.message,
                        timestamp: new Date().toISOString()
                    };
                    globalSuccess = false;
                    logs.push(`Node ${node.id} exception: ${e.message}`);
                }
            } else {
                // Generic node without specific action
                results[node.id] = {
                    status: 'skipped',
                    message: 'No actionId defined',
                    timestamp: new Date().toISOString()
                };
                logs.push(`Node ${node.id} skipped (no actionId)`);
            }
        }

        return NextResponse.json({
            success: globalSuccess,
            results,
            logs
        });

    } catch (error: any) {
        console.error('Workflow execution error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal Server Error'
            },
            { status: 500 }
        );
    }
}
