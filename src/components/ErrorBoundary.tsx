import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-red-500/20 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="w-24 h-24 bg-dark-card border-4 border-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <AlertOctagon className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-3xl font-black text-text-light mb-2">Ops! O sistema capotou.</h1>
          <p className="text-text-muted max-w-sm mb-8">
            Encontramos um erro inesperado nesta página. A culpa provavelmente não é sua (ou talvez seja).
          </p>

          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/dashboard';
            }}
            className="flex items-center gap-2 py-4 px-8 bg-primary-green text-dark-bg rounded-xl font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
          >
            <Home className="w-5 h-5" /> Voltar para Segurança
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
