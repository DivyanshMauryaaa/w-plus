
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Connecting to provider...');

    useEffect(() => {
        const code = searchParams.get('code');
        const state = searchParams.get('state'); // Provider
        const error = searchParams.get('error');

        if (error) {
            setStatus('error');
            setMessage(`Provider Info: ${error}`);
            return;
        }

        if (!code || !state) {
            setStatus('error');
            setMessage('Missing authentication code or state.');
            return;
        }

        const exchangeToken = async () => {
            try {
                const res = await fetch('/api/integrations/auth/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, provider: state })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to exchange token');
                }

                setStatus('success');
                setMessage(`Successfully connected to ${state}! Redirecting...`);

                // Redirect back to integrations page after a moment
                setTimeout(() => {
                    router.push('/integrations');
                }, 2000);

            } catch (err: any) {
                console.error(err);
                setStatus('error');
                setMessage(err.message || 'An error occurred during connection.');
            }
        };

        exchangeToken();
    }, [searchParams, router]);

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                        <p className="text-green-700 font-medium">{message}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <XCircle className="h-12 w-12 text-red-500" />
                        <p className="text-red-600 font-medium text-center">{message}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default function CallbackPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <CallbackContent />
            </Suspense>
        </div>
    );
}
