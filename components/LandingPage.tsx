"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-4 border-b border-dark-200/50">
        <Link href="/" className="text-2xl font-bold text-primary-200">
          PM Interviewer
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="outline" className="text-primary-200 border-primary-200 hover:bg-primary-200/10">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button className="btn-primary">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Main Headline */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-200/10 rounded-full border border-primary-200/20 mb-6">
                <svg className="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-primary-200 font-medium">AI-Powered Interview Practice</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Master Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-200 to-blue-400">
                  Interview Skills
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-light-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                Practice with our AI interviewer and get instant feedback to ace your next product manager interview. 
                Build confidence through realistic mock interviews.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/sign-up">
                <Button className="btn-primary text-lg px-8 py-4 h-auto">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Practicing Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="text-primary-200 border-primary-200 hover:bg-primary-200/10 text-lg px-8 py-4 h-auto">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Demo Preview */}
            <div className="relative">
              <div className="card-border max-w-4xl mx-auto">
                <div className="card p-8">
                  <div className="flex items-center justify-center gap-8">
                    {/* AI Interviewer Card */}
                    <div className="card-interviewer">
                      <div className="avatar">
                        <svg className="w-16 h-16 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        <span className="animate-speak"></span>
                      </div>
                      <h3>AI Interviewer</h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-primary-200 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-primary-200/60 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-primary-200/30 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>

                    {/* User Card */}
                    <div className="card-interviewer">
                      <div className="avatar">
                        <svg className="w-16 h-16 text-light-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3>You</h3>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-dark-200/50 rounded-lg">
                    <p className="text-light-100 text-center italic">
                      "Tell me about a time when you had to prioritize competing product features..."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-dark-200/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose Our AI Interviewer?
              </h2>
              <p className="text-xl text-light-100 max-w-2xl mx-auto">
                Get the practice you need with cutting-edge AI technology designed specifically for product management interviews.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card-border">
                <div className="card p-8 text-center h-full">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Real-time AI Feedback</h3>
                  <p className="text-light-100">
                    Get instant, personalized feedback on your responses to improve your interview performance immediately.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="card-border">
                <div className="card p-8 text-center h-full">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Product-Focused Questions</h3>
                  <p className="text-light-100">
                    Practice with questions specifically designed for product management roles and design thinking challenges.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="card-border">
                <div className="card p-8 text-center h-full">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Private & Secure</h3>
                  <p className="text-light-100">
                    Practice in a safe environment. Your conversations are private and secure, giving you confidence to improve.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-cta">
              <div className="flex-1">
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  Ready to Ace Your Next Interview?
                </h3>
                <p className="text-xl text-light-100 mb-8">
                  Join thousands of professionals who have improved their interview skills with our AI-powered platform.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button className="btn-primary text-lg px-8 py-4 h-auto">
                    Get Started Free
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" className="text-primary-200 border-primary-200 hover:bg-primary-200/10 text-lg px-8 py-4 h-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
