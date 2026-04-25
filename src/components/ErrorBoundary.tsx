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
      // Modificado para não ocupar a tela inteira (min-h-screen removido).
      // Agora ele deve se encaixar dentro do container pai (como o MainLayout)
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center relative w-full h-full min-h-[60vh] bg-dark-bg rounded-2xl">
          <div className="w-24 h-24 bg-dark-card border-4 border-red-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
            <AlertOctagon className="w-12 h-12 text-red-500" />
          </div>

          <h1 className="text-2xl lg:text-3xl font-black text-text-light mb-2">Ops! O sistema capotou.</h1>
          <p className="text-text-muted max-w-sm mb-8 text-sm">
            Encontramos um erro inesperado nesta tela. Tente recarregar ou volte para o painel principal.
          </p>

          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/dashboard';
            }}
            className="flex items-center gap-2 py-3 px-6 bg-primary-green text-dark-bg rounded-xl font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
          >
            <Home className="w-5 h-5" /> Recarregar Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
