import { db } from '@/db/database';
import { createId } from '@/utils/id';
import type {
  ArcMilestone,
  CampaignArc,
  CompanionId,
  LocalDateKey,
  MissionCategory,
} from '@/types/game';

export interface CampaignArcDraft {
  name: string;
  purpose: string;
  category: MissionCategory | 'balanced';
  companionId: CompanionId;
  targetDate?: LocalDateKey;
}

export async function getCampaignArcs() {
  const arcs = await db.campaignArcs.orderBy('createdAt').reverse().toArray();
  const milestones = await db.arcMilestones.orderBy('order').toArray();
  return arcs.map((arc) => ({
    arc,
    milestones: milestones.filter((milestone) => milestone.arcId === arc.id),
  }));
}

export async function createCampaignArc(draft: CampaignArcDraft, milestoneTitles: string[]) {
  const name = draft.name.trim();
  const purpose = draft.purpose.trim();
  if (!name) throw new Error('Give the campaign arc a name.');
  if (!purpose) throw new Error('Describe why this campaign matters.');
  const now = new Date().toISOString();
  const id = createId('campaign-arc');
  const arc: CampaignArc = {
    id,
    name,
    purpose,
    category: draft.category,
    companionId: draft.companionId,
    status: 'active',
    targetDate: draft.targetDate,
    createdAt: now,
    updatedAt: now,
  };
  const titles = milestoneTitles.map((title) => title.trim()).filter(Boolean);
  const milestones: ArcMilestone[] = titles.map((title, order) => ({
    id: createId('arc-milestone'),
    arcId: id,
    title,
    description: '',
    order,
    status: 'pending',
    createdAt: now,
  }));
  await db.transaction('rw', [db.campaignArcs, db.arcMilestones], async () => {
    await db.campaignArcs.put(arc);
    if (milestones.length) await db.arcMilestones.bulkPut(milestones);
  });
  return arc;
}

export async function updateCampaignArc(id: string, draft: CampaignArcDraft) {
  const current = await db.campaignArcs.get(id);
  if (!current) throw new Error('That campaign arc could not be found.');
  const name = draft.name.trim();
  const purpose = draft.purpose.trim();
  if (!name || !purpose) throw new Error('Campaign arcs need both a name and a purpose.');
  await db.campaignArcs.put({
    ...current,
    ...draft,
    name,
    purpose,
    updatedAt: new Date().toISOString(),
  });
}

export async function setCampaignArcStatus(id: string, status: CampaignArc['status']) {
  const current = await db.campaignArcs.get(id);
  if (!current) return;
  const now = new Date().toISOString();
  await db.campaignArcs.put({
    ...current,
    status,
    completedAt: status === 'completed' ? (current.completedAt ?? now) : current.completedAt,
    updatedAt: now,
  });
}

export async function addArcMilestone(arcId: string, title: string, description = '') {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error('Give the milestone a name.');
  const existing = await db.arcMilestones.where('arcId').equals(arcId).toArray();
  const milestone: ArcMilestone = {
    id: createId('arc-milestone'),
    arcId,
    title: cleanTitle,
    description: description.trim(),
    order: existing.length ? Math.max(...existing.map((item) => item.order)) + 1 : 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await db.arcMilestones.put(milestone);
  await db.campaignArcs.update(arcId, { updatedAt: new Date().toISOString() });
  return milestone;
}

export async function toggleArcMilestone(id: string, note = '') {
  const milestone = await db.arcMilestones.get(id);
  if (!milestone) return;
  const completing = milestone.status !== 'completed';
  await db.arcMilestones.put({
    ...milestone,
    status: completing ? 'completed' : 'pending',
    completedAt: completing ? new Date().toISOString() : undefined,
    note: completing && note.trim() ? note.trim() : milestone.note,
  });
  await db.campaignArcs.update(milestone.arcId, { updatedAt: new Date().toISOString() });
}

export async function updateArcMilestone(
  id: string,
  input: { title: string; description?: string; note?: string },
) {
  const milestone = await db.arcMilestones.get(id);
  if (!milestone) return;
  const title = input.title.trim();
  if (!title) throw new Error('A milestone needs a name.');
  await db.arcMilestones.put({
    ...milestone,
    title,
    description: input.description?.trim() ?? milestone.description,
    note: input.note?.trim() || milestone.note,
  });
  await db.campaignArcs.update(milestone.arcId, { updatedAt: new Date().toISOString() });
}
