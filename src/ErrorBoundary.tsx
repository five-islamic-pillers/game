import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-900 text-white flex items-center justify-center p-6" dir="rtl">
          <div className="max-w-md w-full bg-stone-800 border border-stone-700 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold">
              !
            </div>
            <h2 className="text-2xl font-bold text-amber-400">کێشەیەک ڕوویدا لە بارکردنی یارییەکە</h2>
            <p className="text-stone-300 text-sm leading-relaxed">
              تکایە دووبارە پەڕەکە نوێ (Refresh) بکەرەوە بۆ دەستپێکردنەوەی یاری.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition duration-200 cursor-pointer shadow-lg active:scale-98"
            >
              نوێکردنەوەی پەڕە
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
