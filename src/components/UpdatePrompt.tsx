import { Download, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getPwaUpdateState, installPwaUpdate, subscribeToPwaUpdate } from '@/services/pwaUpdate';

export function UpdatePrompt() {
  const [state, setState] = useState(getPwaUpdateState());
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => subscribeToPwaUpdate(() => setState(getPwaUpdateState())), []);
  if (!state.updateAvailable || dismissed) return null;

  return (
    <aside className="update-prompt" role="status" aria-live="polite">
      <span className="update-prompt__icon">
        <Download size={18} />
      </span>
      <div>
        <p className="eyebrow">SYSTEM UPDATE AVAILABLE</p>
        <strong>A new interface version is ready.</strong>
        <small>Your on-device campaign data is preserved.</small>
      </div>
      <button
        className="button button--primary"
        disabled={installing}
        onClick={async () => {
          setInstalling(true);
          try {
            await installPwaUpdate();
          } finally {
            setInstalling(false);
          }
        }}
      >
        {installing ? 'Installing…' : 'Install'}
      </button>
      <button className="icon-button" onClick={() => setDismissed(true)} aria-label="Update later">
        <X size={18} />
      </button>
    </aside>
  );
}
