import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  BrainCircuit,
  Clapperboard,
  FlaskConical,
  MessageSquareCode,
  RadioTower,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { getCompanion, getCompanionImage } from '@/config/companions';
import { ENGINEERING_LIBRARY_TOPICS } from '@/config/engineeringLibrary';
import { STUDIO_TECH_TOPICS } from '@/config/studioTechLibrary';
import { Link } from '@/router';

function askCipher(initialDraft: string) {
  window.dispatchEvent(
    new CustomEvent('system:open-quick-link', {
      detail: { companionId: 'cipher', initialDraft },
    }),
  );
}

export function CipherNexusPage() {
  const cipher = getCompanion('cipher');
  return (
    <div className="page cipher-nexus-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Private technical realm
        </span>
      </div>

      <section className="cipher-nexus-hero panel">
        <div className="cipher-nexus-hero__portrait">
          <img src={getCompanionImage(cipher.image)} alt="Cipher" />
          <span>
            <BrainCircuit size={18} />
          </span>
        </div>
        <div>
          <p className="eyebrow">CIPHER NEXUS · ENGINEERING AND CREATOR TECHNOLOGY</p>
          <h1>The System’s technical intelligence wing.</h1>
          <p>
            Two complete libraries, one study laboratory, and Cipher on call whenever the hardware,
            measurement, spreadsheet, stream, or code refuses to cooperate.
          </p>
          <button
            className="button button--primary"
            type="button"
            onClick={() =>
              askCipher(
                'Cipher, I am in your Nexus. Ask what I am trying to build, measure, troubleshoot, or learn, then direct me to the right library or study lab.',
              )
            }
          >
            <MessageSquareCode size={17} /> Consult Cipher
          </button>
        </div>
      </section>

      <section className="cipher-nexus-realms">
        <article className="panel cipher-nexus-realm is-studio">
          <div className="cipher-nexus-realm__icon">
            <Clapperboard size={30} />
          </div>
          <p className="eyebrow">CREATOR SYSTEMS</p>
          <h2>Studio Tech Vault</h2>
          <p>
            Cameras, microphones, lighting, capture cards, OBS, audio routing, streaming, encoding,
            delivery, and signal-chain troubleshooting.
          </p>
          <div className="cipher-nexus-realm__stats">
            <span>
              <strong>{STUDIO_TECH_TOPICS.length}</strong> technical dossiers
            </span>
            <span>
              <Wrench size={15} /> setup and fault paths
            </span>
          </div>
          <Link className="button button--primary" to="/cipher-studio-tech">
            Enter Studio Tech <ArrowRight size={17} />
          </Link>
        </article>

        <article className="panel cipher-nexus-realm is-engineering">
          <div className="cipher-nexus-realm__icon">
            <RadioTower size={30} />
          </div>
          <p className="eyebrow">ENGINEERING SYSTEMS</p>
          <h2>Engineering Core</h2>
          <p>
            RF, S-parameters, phase noise, instruments, Excel, automation, Python, coding, and
            disciplined measurement practice.
          </p>
          <div className="cipher-nexus-realm__stats">
            <span>
              <strong>{ENGINEERING_LIBRARY_TOPICS.length}</strong> engineering dossiers
            </span>
            <span>
              <BookOpenCheck size={15} /> official grounding
            </span>
          </div>
          <div className="cipher-nexus-realm__actions">
            <Link className="button button--primary" to="/cipher-library">
              Open Library <ArrowRight size={17} />
            </Link>
            <Link className="button button--secondary" to="/cipher-study-lab">
              <FlaskConical size={17} /> Study Lab
            </Link>
          </div>
        </article>
      </section>

      <section className="cipher-nexus-lab panel">
        <FlaskConical size={26} />
        <div>
          <p className="eyebrow">ACTIVE LEARNING</p>
          <h2>Don’t just read it. Work the problem.</h2>
          <p>
            Run targeted quizzes, inspect every explanation, then operate five educational benches:
            phase noise, VNA and S-parameters, spectrum and intermodulation, oscilloscope sampling,
            and Y-factor noise figure.
          </p>
        </div>
        <Link className="button button--primary" to="/cipher-study-lab">
          Launch Study Lab <ArrowRight size={17} />
        </Link>
      </section>
    </div>
  );
}
