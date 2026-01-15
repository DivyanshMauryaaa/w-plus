'use client'

import { SignIn } from '@clerk/nextjs'
import { Star, Quote, Sparkles, CheckCircle2, Shield, Rocket } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function SignInPage() {
    return (
        <div className="w-full flex">
            {/* Left Side - Sign In Form */}
            <div className="w-full flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back</h2>
                        <p className="text-muted-foreground">Sign in to continue your journey</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <SignIn
                            appearance={{
                                elements: {
                                    formButtonPrimary:
                                        'bg-primary hover:bg-primary/90 text-primary-foreground text-sm normal-case shadow-lg hover:shadow-xl transition-all duration-200',
                                    card: 'shadow-2xl',
                                    headerTitle: 'text-2xl font-bold',
                                    headerSubtitle: 'text-muted-foreground',
                                    socialButtonsBlockButton:
                                        'border-2 hover:bg-accent transition-all duration-200',
                                    formFieldInput:
                                        'border-2 focus:border-primary transition-all duration-200',
                                    footerActionLink:
                                        'text-primary hover:text-primary/90 font-semibold'
                                }
                            }}
                        />
                    </div>

                    {/* Mobile features preview */}
                    <div className="lg:hidden mt-8">
                        <Card className="bg-card p-6 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <Shield className="w-5 h-5 text-primary" />
                                <p className="text-card-foreground font-semibold text-sm">Secure & Trusted</p>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Your data is protected with enterprise-grade security
                            </p>
                        </Card>
                    </div>
                </div>
            </div>        
        </div>
    )
}
