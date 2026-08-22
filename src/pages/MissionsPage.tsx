import { Filter, ListChecks } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MissionCard } from '@/components/MissionCard';
import { AgentMissionBoard } from '@/components/AgentMissionBoard';
import { ProgressBar } from '@/components/ProgressBar';
import { CATEGORY_LABELS } from '@/config/missions';
import { getActiveMissions } from '@/game/engine';
import { useGameStore } from '@/store/useGameStore';
import type { MissionCategory, MissionStatus } from '@/types/game';

export function MissionsPage() {
  const { missions, todayRecords, settings, systemDate, refresh } = useGameStore();
  const focusedMissionId = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get(
    'focus',
  );
  const [filter, setFilter] = useState<MissionStatus | 'all'>(focusedMissionId ? 'pending' : 'all');
  const active = useMemo(
    () => (settings ? getActiveMissions(missions, settings, systemDate) : []),
    [missions, settings, systemDate],
  );
  const recordMap = useMemo(
    () => new Map(todayRecords.map((record) => [record.missionId, record])),
    [todayRecords],
  );
  const completed = todayRecords.filter((record) => record.status === 'completed').length;
  const categories: MissionCategory[] = ['faith', 'discipline', 'physical', 'creator', 'character'];

  useEffect(() => {
    if (!focusedMissionId) return;
    setFilter('pending');
    const timer = window.setTimeout(() => {
      document.getElementById(`mission-${focusedMissionId}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      document.getElementById(`mission-${focusedMissionId}`)?.focus({ preventScroll: true });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [focusedMissionId]);

  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">DAILY OBJECTIVE INTERFACE</p>
          <h1>Missions</h1>
          <p>Complete what matters. Optional details remain private on this device.</p>
        </div>
        <span className="page-heading__glyph">
          <ListChecks size={25} />
        </span>
      </header>
      <section className="panel mission-overview">
        <div className="mission-overview__copy">
          <span>Current cycle</span>
          <strong>
            {completed} / {todayRecords.length}
          </strong>
        </div>
        <ProgressBar value={completed} max={todayRecords.length} />
        <div className="filter-chips" aria-label="Filter missions">
          <Filter size={15} />
          {(['all', 'pending', 'completed', 'failed', 'excused'] as const).map((option) => (
            <button
              key={option}
              className={filter === option ? 'is-active' : ''}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
      {settings && (
        <AgentMissionBoard
          systemDate={systemDate}
          enabledCompanionIds={settings.enabledCompanionIds}
          onProgressionChanged={refresh}
        />
      )}
      <div className="mission-groups">
        {categories.map((category) => {
          const categoryMissions = active.filter((mission) => {
            const record = recordMap.get(mission.id);
            return (
              mission.category === category &&
              record &&
              (filter === 'all' || record.status === filter)
            );
          });
          if (!categoryMissions.length) return null;
          return (
            <section key={category} className="mission-group">
              <header>
                <span className={`category-rune category-rune--${category}`} />
                <div>
                  <p className="eyebrow">{CATEGORY_LABELS[category]}</p>
                  <h2>
                    {categoryMissions.length}{' '}
                    {categoryMissions.length === 1 ? 'directive' : 'directives'}
                  </h2>
                </div>
              </header>
              <div className="mission-list">
                {categoryMissions.map((mission) => {
                  const record = recordMap.get(mission.id)!;
                  return (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      record={record}
                      date={systemDate}
                      focused={mission.id === focusedMissionId}
                    />
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
