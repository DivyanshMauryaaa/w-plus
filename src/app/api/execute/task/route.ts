import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '@/lib/executor';
import { ActionType } from '@/lib/integrations';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { actionId, config, credentials } = body;
        const { userId } = await auth(); // Get logged in user ID

        if (!actionId) {
            return NextResponse.json(
                { error: 'actionId is required' },
                { status: 400 }
            );
        }

        const result = await executeAction(actionId as ActionType, config || {}, credentials, userId || undefined);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Task execution error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Internal Server Error'
            },
            { status: 500 }
        );
    }
}
