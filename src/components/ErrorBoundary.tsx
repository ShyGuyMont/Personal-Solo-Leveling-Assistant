import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Download, RefreshCw, ShieldAlert } from 'lucide-react';
import { downloadSave } from '@/db/backup';

interface State {
  error?: Error;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = {};

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('The System recovered from a render failure.', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="fatal-recovery">
        <ShieldAlert size={34} />
        <p className="eyebrow">RECOVERY INTERFACE</p>
        <h1>The interface hit an unexpected error.</h1>
        <p>
          Your campaign remains stored on this device. Reload the interface, or export a save before
          troubleshooting.
        </p>
        <div>
          <button className="button button--primary" onClick={() => window.location.reload()}>
            <RefreshCw size={17} /> Reload interface
          </button>
          <button className="button button--ghost" onClick={() => void downloadSave()}>
            <Download size={17} /> Export save
          </button>
        </div>
        <details>
          <summary>Technical detail</summary>
          <code>{this.state.error.message}</code>
        </details>
      </main>
    );
  }
}
