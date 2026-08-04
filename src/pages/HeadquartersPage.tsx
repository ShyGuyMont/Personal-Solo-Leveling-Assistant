import {
  ArrowLeft,
  BookOpenCheck,
  ChevronRight,
  Crown,
  Flame,
  Heart,
  MessageCircle,
  MessagesSquare,
  Map,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { CampfireRecapView } from '@/components/CampfireRecapView';
import { MonthlyCouncilView } from '@/components/MonthlyCouncilView';
import { COMPANIONS, getCompanion, getCompanionImage } from '@/config/companions';
import { getFavoriteMessages } from '@/game/favorites';
import { getRecentCampfireRecaps } from '@/game/campfire';
import { getRecentMonthlyCouncils } from '@/game/council';
import { getRecentPartyCheckIns } from '@/game/partyChat';
import { getRecentSupportConversations } from '@/game/support';
import { Link } from '@/router';
import { useGameStore } from '@/store/useGameStore';
import { formatLongDate } from '@/utils/date';
import type { CampfireRecap, MonthlyCouncil } from '@/types/game';

export function HeadquartersPage() {
  const { profile, settings } = useGameStore();
  const [recaps, setRecaps] = useState<CampfireRecap[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [checkInCount, setCheckInCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [councils, setCouncils] = useState<MonthlyCouncil[]>([]);

  useEffect(() => {
    void Promise.all([
      getRecentCampfireRecaps(24).then(setRecaps),
      getFavoriteMessages().then((items) => setFavoriteCount(items.length)),
      getRecentPartyCheckIns(120).then((items) => setCheckInCount(items.length)),
      getRecentSupportConversations(120).then((items) => setSupportCount(items.length)),
      getRecentMonthlyCouncils(24).then(setCouncils),
    ]);
  }, []);

  const enabled = new Set(settings?.enabledCompanionIds ?? []);
  const firstName = profile?.displayName.trim().split(/\s+/)[0] || 'Hunter';
  const ember = getCompanion('ember');
  const amara = getCompanion('amara');

  return (
    <div className="page headquarters-page">
      <div className="party-chat__topbar">
        <Link className="text-link" to="/">
          <ArrowLeft size={17} /> Back to System
        </Link>
        <span className="party-chat__saved">
          <ShieldCheck size={15} /> Local party link secure
        </span>
      </div>

      <section className="headquarters-hero panel">
        <div className="headquarters-hero__portraits" aria-label="Your eight System companions">
          {COMPANIONS.map((companion, index) => (
            <img
              key={companion.id}
              src={getCompanionImage(companion.image)}
              alt={companion.name}
              style={
                {
                  '--portrait-left': index < 4 ? `${index * 23}%` : `${(index - 4) * 23}%`,
                  '--portrait-top': index < 4 ? '0%' : '38%',
                  '--portrait-angle': `${(index - 3) * 1.25}deg`,
                  '--companion-accent': companion.accent,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div>
          <p className="eyebrow">FULL PARTY HEADQUARTERS · EIGHT LINKS ONLINE</p>
          <h1>Your people are here, {firstName}.</h1>
          <p>
            Check in, request support, revisit words worth carrying, or gather around the weekly
            campfire. Headquarters changes no score by itself—it gives the journey a place to feel
            shared.
          </p>
        </div>
      </section>

      <section className="headquarters-actions">
        <Link to="/party-chat?tab=check-in" className="panel">
          <span>
            <MessageCircle size={22} />
          </span>
          <div>
            <strong>Party Check-In</strong>
            <p>Choose how you feel and hear from everyone.</p>
            <small>
              {checkInCount} saved check-in{checkInCount === 1 ? '' : 's'}
            </small>
          </div>
        </Link>
        <Link to="/party-chat?tab=support" className="panel">
          <span>
            <MessagesSquare size={22} />
          </span>
          <div>
            <strong>Direct Support</strong>
            <p>Ask the whole party or one specific companion.</p>
            <small>
              {supportCount} saved support channel{supportCount === 1 ? '' : 's'}
            </small>
          </div>
        </Link>
        <Link to="/party-chat?tab=saved" className="panel">
          <span>
            <Heart size={22} />
          </span>
          <div>
            <strong>Words to Carry</strong>
            <p>Return to the messages that found you at the right time.</p>
            <small>
              {favoriteCount} saved message{favoriteCount === 1 ? '' : 's'}
            </small>
          </div>
        </Link>
        <Link to="/about" className="panel">
          <span>
            <BookOpenCheck size={22} />
          </span>
          <div>
            <strong>Snow’s Briefing</strong>
            <p>Get a clear explanation of every part of the System.</p>
            <small>Offline guide</small>
          </div>
        </Link>
        <Link to="/campaigns" className="panel">
          <span>
            <Map size={22} />
          </span>
          <div>
            <strong>Campaign Command</strong>
            <p>Open Campaign Arcs and all eight companion questlines.</p>
            <small>40 story chapters</small>
          </div>
        </Link>
        <Link to="/update-center" className="panel">
          <span>
            <ShieldCheck size={22} />
          </span>
          <div>
            <strong>Update Center</strong>
            <p>Check releases and open the Archive Shield.</p>
            <small>Version 3.5</small>
          </div>
        </Link>
      </section>

      <Link to="/treasury" className="headquarters-treasury panel">
        <span>
          <WalletCards size={23} />
        </span>
        <div>
          <p className="eyebrow">CASSIAN · TREASURY COMMAND</p>
          <strong>Open the private ledger</strong>
          <small>Paychecks, spending, bills, debt, savings, and weekly reviews</small>
        </div>
        <ChevronRight size={19} />
      </Link>

      {councils[0] ? (
        <section className="headquarters-campfire panel headquarters-council">
          <div className="headquarters-section-title">
            <div>
              <p className="eyebrow">LATEST MONTHLY COUNCIL</p>
              <h2>The full party closes a chapter</h2>
            </div>
            <Crown size={23} />
          </div>
          <MonthlyCouncilView
            council={councils[0]}
            onChanged={() => void getRecentMonthlyCouncils(24).then(setCouncils)}
          />
          {councils.length > 1 && (
            <div className="campfire-history">
              <p className="eyebrow">PAST COUNCILS</p>
              {councils.slice(1).map((council) => (
                <details key={council.id}>
                  <summary>
                    <span>
                      <Crown size={16} />
                    </span>
                    <div>
                      <strong>{formatLongDate(council.monthStart)}</strong>
                      <small>
                        {council.metrics.completedMissions}/{council.metrics.availableMissions}{' '}
                        missions · {council.metrics.questChapters} quest chapters
                      </small>
                    </div>
                  </summary>
                  <MonthlyCouncilView
                    council={council}
                    compact
                    onChanged={() => void getRecentMonthlyCouncils(24).then(setCouncils)}
                  />
                </details>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="headquarters-campfire-empty panel">
          <span>
            <Crown size={28} />
          </span>
          <div>
            <p className="eyebrow">MONTHLY COUNCIL</p>
            <h2>The first council is still gathering.</h2>
            <p>
              After a calendar month with at least one finalized Daily Review, all eight companions
              will assemble with a fact-based review and space for your next intention.
            </p>
          </div>
        </section>
      )}

      {recaps[0] ? (
        <section className="headquarters-campfire panel">
          <div className="headquarters-section-title">
            <div>
              <p className="eyebrow">LATEST CAMPFIRE</p>
              <h2>The week, in the party’s words</h2>
            </div>
            <Flame size={23} />
          </div>
          <CampfireRecapView recap={recaps[0]} />
          {recaps.length > 1 && (
            <div className="campfire-history">
              <p className="eyebrow">PAST CAMPFIRES</p>
              {recaps.slice(1).map((recap) => (
                <details key={recap.id}>
                  <summary>
                    <span>
                      <Flame size={16} />
                    </span>
                    <div>
                      <strong>{formatLongDate(recap.weekStart)}</strong>
                      <small>
                        {recap.metrics.completedMissions}/{recap.metrics.availableMissions} missions
                        · {recap.metrics.perfectDays} Perfect Days
                      </small>
                    </div>
                  </summary>
                  <CampfireRecapView recap={recap} compact />
                </details>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="headquarters-campfire-empty panel">
          <span>
            <Flame size={28} />
          </span>
          <div>
            <p className="eyebrow">WEEKLY CAMPFIRE</p>
            <h2>The first recap is still gathering.</h2>
            <p>
              After a completed week with at least one finalized Daily Review, all eight companions
              will meet here with comments based on the real record.
            </p>
          </div>
        </section>
      )}

      <section
        className="ember-protocol panel"
        style={{ '--companion-accent': ember.accent } as CSSProperties}
      >
        <img src={getCompanionImage(ember.image)} alt="Ember, The Ignition" />
        <div>
          <p className="eyebrow">EMBER · LOCK-IN PROTOCOL</p>
          <h2>A hard reset without the shame spiral.</h2>
          <p>
            When the previous day is still unfinished or closes below 50%, Ember may open one
            re-entry signal. She will be blunt about the next move, but she never insults you,
            removes XP, changes a streak, or treats struggle as a character flaw.
          </p>
          <blockquote>“I am here to stop one rough day from recruiting the next one.”</blockquote>
        </div>
      </section>

      <section
        className="ember-protocol amara-protocol panel"
        style={{ '--companion-accent': amara.accent } as CSSProperties}
      >
        <img src={getCompanionImage(amara.image)} alt="Amara, The Heartweaver" />
        <div>
          <p className="eyebrow">AMARA · HEARTWEAVER PROTOCOL</p>
          <h2>Connection without self-abandonment.</h2>
          <p>
            Amara supports friendship, family, romance, community, honest communication,
            appreciation, repair, and healthy boundaries. She never asks you to contact someone
            unsafe or confuse access with love.
          </p>
          <blockquote>“Your no gives your yes somewhere trustworthy to live.”</blockquote>
        </div>
      </section>

      <section className="headquarters-roster panel">
        <div className="headquarters-section-title">
          <div>
            <p className="eyebrow">PARTY ROSTER</p>
            <h2>Eight different kinds of support</h2>
          </div>
          <Users size={23} />
        </div>
        <div className="headquarters-roster__grid">
          {COMPANIONS.map((companion) => {
            const isEnabled = enabled.has(companion.id) && settings?.companionMode !== 'off';
            return (
              <article
                key={companion.id}
                style={{ '--companion-accent': companion.accent } as CSSProperties}
                className={companion.primary ? 'is-primary' : ''}
              >
                <img src={getCompanionImage(companion.image)} alt="" />
                <div>
                  <span>
                    {isEnabled ? (
                      <>
                        <Radio size={11} /> LINK ONLINE
                      </>
                    ) : (
                      'LINK MUTED'
                    )}
                  </span>
                  <strong>{companion.name}</strong>
                  <small>{companion.title}</small>
                  <p>{companion.description}</p>
                  <em>{companion.shortRole}</em>
                </div>
              </article>
            );
          })}
        </div>
        <div className="headquarters-roster__footer">
          <Sparkles size={16} />
          <span>Companion frequency and individual links remain adjustable in Settings.</span>
          <Link to="/settings" className="text-link">
            Manage Party
          </Link>
        </div>
      </section>
    </div>
  );
}
