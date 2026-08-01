import {
  ArrowLeft,
  BatteryLow,
  Circle,
  CloudRain,
  Flame,
  Heart,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  Radio,
  RotateCcw,
  ShieldCheck,
  Smile,
  Sparkles,
  TriangleAlert,
  Trophy,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { FavoriteMessageButton } from '@/components/FavoriteMessageButton';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { getMoodDefinition, PARTY_MOODS } from '@/config/partyChat';
import { getSupportTopic, SUPPORT_TOPICS } from '@/config/support';
import { getFavoriteId, getFavoriteMessages, toggleFavoriteMessage } from '@/game/favorites';
import { createPartyCheckIn, getRecentPartyCheckIns } from '@/game/partyChat';
import { createSupportConversation, getRecentSupportConversations } from '@/game/support';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import { formatLongDate } from '@/utils/date';
import type {
  FavoriteMessage,
  FavoriteMessageSource,
  MoodId,
  PartyCheckIn,
  SupportAudience,
  SupportConversation,
  SupportTopicId,
} from '@/types/game';

const MOOD_ICONS: Record<MoodId, LucideIcon> = {
  energized: Zap,
  proud: Trophy,
  good: Smile,
  okay: Circle,
  tired: BatteryLow,
  stressed: TriangleAlert,
  frustrated: Flame,
  discouraged: CloudRain,
  lonely: Heart,
  unsure: HelpCircle,
};

type ChannelTab = 'check-in' | 'support' | 'saved';

export function PartyChatPage() {
  const { profile, systemDate } = useGameStore();
  const [tab, setTab] = useState<ChannelTab>('check-in');
  const [activeCheckIn, setActiveCheckIn] = useState<PartyCheckIn>();
  const [activeSupport, setActiveSupport] = useState<SupportConversation>();
  const [recentCheckIns, setRecentCheckIns] = useState<PartyCheckIn[]>([]);
  const [recentSupport, setRecentSupport] = useState<SupportConversation[]>([]);
  const [favorites, setFavorites] = useState<FavoriteMessage[]>([]);
  const [supportTopic, setSupportTopic] = useState<SupportTopicId>();
  const [creating, setCreating] = useState(false);

  const refreshFavorites = useCallback(async () => setFavorites(await getFavoriteMessages()), []);

  useEffect(() => {
    void Promise.all([
      getRecentPartyCheckIns(5).then(setRecentCheckIns),
      getRecentSupportConversations(5).then(setRecentSupport),
      refreshFavorites(),
    ]);
  }, [refreshFavorites]);

  async function chooseMood(mood: MoodId) {
    if (creating) return;
    setCreating(true);
    try {
      const checkIn = await createPartyCheckIn(mood, systemDate);
      setActiveCheckIn(checkIn);
      setRecentCheckIns((current) => [checkIn, ...current].slice(0, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setCreating(false);
    }
  }

  async function openSupport(audience: SupportAudience) {
    if (!supportTopic || creating) return;
    setCreating(true);
    try {
      const conversation = await createSupportConversation(supportTopic, audience, systemDate);
      setActiveSupport(conversation);
      setRecentSupport((current) => [conversation, ...current].slice(0, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setCreating(false);
    }
  }

  const conversation = activeCheckIn ?? activeSupport;
  if (conversation) {
    const sourceType: FavoriteMessageSource = activeCheckIn ? 'check-in' : 'support';
    const title = activeCheckIn
      ? `Checking in: ${getMoodDefinition(activeCheckIn.mood).label}`
      : `Direct support: ${getSupportTopic(activeSupport!.topic).label}`;
    const accent = activeCheckIn
      ? getMoodDefinition(activeCheckIn.mood).accent
      : getSupportTopic(activeSupport!.topic).accent;
    const isWholeParty = activeCheckIn || activeSupport?.audience === 'party';
    const audienceCompanion = activeSupport && activeSupport.audience !== 'party'
      ? getCompanion(activeSupport.audience)
      : undefined;
    return (
      <div className="page party-chat-page">
        <div className="party-chat__topbar">
          <button
            className="text-link"
            onClick={() => {
              setActiveCheckIn(undefined);
              setActiveSupport(undefined);
            }}
          >
            <ArrowLeft size={17} /> Party Channel
          </button>
          <span className="party-chat__saved"><ShieldCheck size={15} /> Saved locally</span>
        </div>

        <section className="party-conversation" aria-live="polite">
          <header className="party-conversation__header">
            <p className="eyebrow">
              {activeCheckIn ? 'PARTY CHECK-IN' : 'DIRECT SUPPORT'} · {formatLongDate(conversation.date)}
            </p>
            <h1><span style={{ color: accent }}>{title}</span></h1>
            <p>
              {isWholeParty
                ? 'Everyone is here. No points, no judgment—just your party meeting you where you are.'
                : `${audienceCompanion?.name} opened a focused support channel for you.`}
            </p>
          </header>

          <div className="party-message-list">
            {conversation.messages
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((message) => {
                const companion = getCompanion(message.companionId);
                const favoriteId = getFavoriteId(sourceType, message.id);
                return (
                  <article
                    key={message.id}
                    className={`party-message party-message--${message.role} ${companion.primary ? 'party-message--snow' : ''}`}
                    style={{
                      '--companion-accent': companion.accent,
                      '--message-delay': `${message.order * 90}ms`,
                    } as CSSProperties}
                  >
                    <div className="party-message__portrait">
                      <img src={getCompanionImage(companion.image)} alt="" />
                      <span style={{ background: companion.accent }} />
                    </div>
                    <div className="party-message__bubble">
                      <div className="party-message__name">
                        <strong>{companion.name}</strong>
                        <span>{companion.title}</span>
                        {message.role === 'closing' && isWholeParty && <em>PARTY WRAP-UP</em>}
                      </div>
                      <p>“{message.message}”</p>
                      <FavoriteMessageButton
                        active={favorites.some((favorite) => favorite.id === favoriteId)}
                        onToggle={async () => {
                          await toggleFavoriteMessage({
                            sourceType,
                            sourceId: conversation.id,
                            messageId: message.id,
                            companionId: message.companionId,
                            message: message.message,
                          });
                          await refreshFavorites();
                        }}
                      />
                    </div>
                  </article>
                );
              })}
          </div>

          <footer className="party-conversation__actions">
            <button
              className="button button--ghost"
              onClick={() => {
                setActiveCheckIn(undefined);
                setActiveSupport(undefined);
              }}
            >
              <RotateCcw size={17} /> Start another
            </button>
            <Link className="button button--primary" to="/">Return to System</Link>
          </footer>
        </section>
      </div>
    );
  }

  const snow = getCompanion('snow');
  const firstName = profile?.displayName.trim().split(/\s+/)[0] || 'Hunter';
  return (
    <div className="page party-chat-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/"><ArrowLeft size={17} /> Back to System</Link>
        <span className="party-chat__saved"><LockKeyhole size={15} /> Private & offline</span>
      </div>

      <section className="party-chat-hero panel">
        <div className="party-chat-hero__portrait">
          <img src={getCompanionImage(snow.image)} alt="Snow, The Constant" />
          <span />
        </div>
        <div className="party-chat-hero__copy">
          <p className="eyebrow">SNOW OPENED THE PARTY CHANNEL</p>
          <h1>What do you need, {firstName}?</h1>
          <p>“Check in, ask for support, or return to words you wanted to keep. The channel is yours.”</p>
        </div>
      </section>

      <nav className="party-channel-tabs" aria-label="Party Channel views">
        <button className={tab === 'check-in' ? 'is-active' : ''} onClick={() => setTab('check-in')}>
          <Radio size={17} /> Check-in
        </button>
        <button className={tab === 'support' ? 'is-active' : ''} onClick={() => setTab('support')}>
          <MessagesSquare size={17} /> Direct support
        </button>
        <button className={tab === 'saved' ? 'is-active' : ''} onClick={() => setTab('saved')}>
          <Heart size={17} /> Saved
        </button>
      </nav>

      {tab === 'check-in' && (
        <>
          <section className="panel mood-selector">
            <header className="section-header">
              <div><p className="eyebrow">EMOTIONAL CHECK-IN</p><h2>How are you feeling?</h2></div>
              <MessageCircle size={21} />
            </header>
            <div className="mood-grid">
              {PARTY_MOODS.map((mood) => {
                const Icon = MOOD_ICONS[mood.id];
                return (
                  <button
                    key={mood.id}
                    className="mood-option"
                    style={{ '--mood-accent': mood.accent } as CSSProperties}
                    onClick={() => void chooseMood(mood.id)}
                    disabled={creating}
                  >
                    <span><Icon size={20} /></span>
                    <strong>{mood.label}</strong>
                    <small>{mood.description}</small>
                  </button>
                );
              })}
            </div>
            <div className="party-chat__privacy-note">
              <ShieldCheck size={17} />
              <span>This is support, not a score. Your answer changes no XP, streak, mission, or reward.</span>
            </div>
          </section>
          {recentCheckIns.length > 0 && (
            <section className="party-chat-history panel">
              <header className="section-header">
                <div><p className="eyebrow">RECENT CHECK-INS</p><h2>Your party remembers</h2></div>
                <Sparkles size={20} />
              </header>
              <div className="party-chat-history__list">
                {recentCheckIns.slice(0, 3).map((checkIn) => {
                  const mood = getMoodDefinition(checkIn.mood);
                  return (
                    <div key={checkIn.id}>
                      <span style={{ background: mood.accent }} />
                      <div><strong>{mood.label}</strong><small>{formatLongDate(checkIn.date)}</small></div>
                    </div>
                  );
                })}
              </div>
              <Link to="/archive" className="text-link">Open full Archive</Link>
            </section>
          )}
        </>
      )}

      {tab === 'support' && (
        <section className="panel direct-support">
          <header className="section-header">
            <div>
              <p className="eyebrow">DIRECT SUPPORT</p>
              <h2>{supportTopic ? 'Who do you want to hear from?' : 'What would help right now?'}</h2>
            </div>
            <MessagesSquare size={21} />
          </header>
          {!supportTopic ? (
            <div className="support-topic-grid">
              {SUPPORT_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  style={{ '--support-accent': topic.accent } as CSSProperties}
                  onClick={() => setSupportTopic(topic.id)}
                >
                  <span />
                  <strong>{topic.label}</strong>
                  <small>{topic.description}</small>
                </button>
              ))}
            </div>
          ) : (
            <>
              <button className="text-link direct-support__back" onClick={() => setSupportTopic(undefined)}>
                <ArrowLeft size={16} /> Choose a different need
              </button>
              <div className="direct-support__prompt">
                <strong>{getSupportTopic(supportTopic).label}</strong>
                <p>“{getSupportTopic(supportTopic).prompt}”</p>
              </div>
              <div className="support-audience-grid">
                <button className="support-audience support-audience--party" onClick={() => void openSupport('party')} disabled={creating}>
                  <span><Users size={23} /></span>
                  <div><strong>Whole Party</strong><small>Everyone responds; Snow opens and closes.</small></div>
                </button>
                {COMPANIONS.map((companion) => (
                  <button key={companion.id} className="support-audience" onClick={() => void openSupport(companion.id)} disabled={creating}>
                    <img src={getCompanionImage(companion.image)} alt="" />
                    <div><strong>{companion.name}</strong><small>{companion.title}</small></div>
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="party-chat__privacy-note">
            <ShieldCheck size={17} />
            <span>Direct Support is selection-based, private, offline, and never changes progression.</span>
          </div>
          {recentSupport.length > 0 && !supportTopic && (
            <div className="direct-support__recent">
              <p className="eyebrow">RECENT SUPPORT CHANNELS</p>
              {recentSupport.slice(0, 3).map((item) => (
                <span key={item.id}>{getSupportTopic(item.topic).label} · {formatLongDate(item.date)}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'saved' && (
        <section className="panel words-to-carry">
          <header className="section-header">
            <div><p className="eyebrow">WORDS TO CARRY</p><h2>Messages you kept</h2></div>
            <Heart size={21} />
          </header>
          <p className="words-to-carry__intro">Tap the heart beside any Party message, banter line, milestone celebration, or companion pop-up to keep it here.</p>
          <div className="words-to-carry__list">
            {favorites.map((favorite) => {
              const companion = getCompanion(favorite.companionId);
              return (
                <article key={favorite.id} style={{ '--companion-accent': companion.accent } as CSSProperties}>
                  <img src={getCompanionImage(companion.image)} alt="" />
                  <div><strong>{companion.name}</strong><p>“{favorite.message}”</p><small>{favorite.sourceType.replace('-', ' ')}</small></div>
                  <FavoriteMessageButton
                    active
                    onToggle={async () => {
                      await toggleFavoriteMessage({
                        sourceType: favorite.sourceType,
                        sourceId: favorite.sourceId,
                        messageId: favorite.messageId,
                        companionId: favorite.companionId,
                        message: favorite.message,
                      });
                      await refreshFavorites();
                    }}
                  />
                </article>
              );
            })}
            {!favorites.length && (
              <div className="empty-state"><Heart size={22} /><span>Messages you favorite will wait for you here.</span></div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
