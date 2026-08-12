import { Download, Share } from 'lucide-react';
import { useEffect, useState } from 'react';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallCard() {
  const [event, setEvent] = useState<InstallEvent>();
  const [installed, setInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true,
  );
  useEffect(() => {
    const handler = (installEvent: Event) => {
      installEvent.preventDefault();
      setEvent(installEvent as InstallEvent);
    };
    const appInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', appInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', appInstalled);
    };
  }, []);
  if (installed) return null;
  const isiPhone = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return (
    <aside className="install-card">
      <span className="install-card__icon">
        {isiPhone ? <Share size={19} /> : <Download size={19} />}
      </span>
      <div>
        <strong>Install The System</strong>
        <p>
          {isiPhone
            ? 'In Safari, tap Share, then Add to Home Screen for the full-screen offline experience.'
            : 'Install for a full-screen experience that works offline.'}
        </p>
      </div>
      {event && (
        <button
          className="button button--small"
          onClick={async () => {
            await event.prompt();
            const choice = await event.userChoice;
            if (choice.outcome === 'accepted') setInstalled(true);
          }}
        >
          Install
        </button>
      )}
    </aside>
  );
}
