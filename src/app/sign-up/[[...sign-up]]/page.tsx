'use client'

import { SignUp } from '@clerk/nextjs'
import { Star, Quote, Sparkles, TrendingUp, Users, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'

export default function SignUpPage() {
    return (
        <div className="min-h-screen w-full flex">
            <div className="w-full flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-foreground mb-2">Skip the bullshit & get sh*t done fast</h2>
                        <p className="text-muted-foreground">Sign up to get started</p>
                    </div>

                    <div className="flex items-center justify-center">
                        <SignUp
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

                    <div className="lg:hidden mt-8">
                        <Card className="bg-card p-6 shadow-lg">
                            <div className="flex gap-1 mb-3">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-card-foreground text-sm mb-4">
                                "This platform has completely transformed how I work. Highly recommended!"
                            </p>
                            <p className="text-card-foreground font-semibold text-sm">Sarah Mitchell</p>
                            <p className="text-muted-foreground text-xs">Product Designer</p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
