import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Ocurrió un error inesperado.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught error:', error);
  }

  render() {
    if (this.state.hasError) {
      let friendly = 'Hubo un problema de conexión o permisos con el servicio.';
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed && parsed.error) {
          friendly = `Error en operación (${parsed.operationType || 'datos'}): ${parsed.error}`;
        }
      } catch {
        friendly = this.state.errorMessage;
      }

      return (
        <div className="min-h-screen bg-[#0D0D11] text-[#E4E1E6] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#18181B] border border-[#27272A] rounded-lg p-6 voxel-bevel space-y-4">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="font-display text-xl font-bold text-[#E4E1E6]">
                Algo salió mal en Slime Craft
              </h1>
            </div>
            <p className="text-sm text-[#BCCBB9] leading-relaxed break-words">{friendly}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#22C55E] text-[#002109] font-display font-bold text-sm rounded hover:bg-[#4BE277] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
