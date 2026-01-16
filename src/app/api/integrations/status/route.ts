
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const user = await currentUser();
    if (!user) return NextResponse.json({}); // Not logged in

    const { data, error } = await supabase
        .from('connected_accounts')
        .select('provider')
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Convert list to map boolean
    const connections: Record<string, boolean> = {};
    data.forEach((row: any) => {
        connections[row.provider] = true;
    });

    return NextResponse.json({
        connections
    });
}
