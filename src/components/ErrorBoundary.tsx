import React from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = 'An unexpected issue interrupted the session.';
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.error?.toLowerCase().includes('quota')) {
        readable = 'Daily database quota has been reached. Please try again tomorrow.';
      } else if (parsed?.error?.toLowerCase().includes('permission')) {
        readable = 'Account verification is required to complete that database action.';
      }
    } catch {
      if (error.message) {
        readable = error.message;
      }
    }
    return { hasError: true, message: readable };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-[#E5E7E3] rounded-xl p-8 text-center">
            <div className="w-11 h-11 rounded-lg bg-[#F3F4F2] text-[#111312] flex items-center justify-center mx-auto mb-5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h1 className="font-display text-xl font-semibold text-[#111312] mb-2">
              Session Interrupted
            </h1>
            <p className="text-sm text-[#575C58] mb-6 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#111312] text-white text-sm font-medium hover:bg-[#262B28] transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              Reload NutriVerify
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
