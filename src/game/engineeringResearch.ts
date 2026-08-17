import { db } from '@/db/database';
import type { EngineeringResearchResult } from '@/services/aiHeadquarters';

const RESEARCH_PREFIX = 'cipher-research:';

export interface EngineeringResearchNote extends EngineeringResearchResult {
  id: string;
  query: string;
  createdAt: string;
}

export async function saveEngineeringResearch(query: string, result: EngineeringResearchResult) {
  const createdAt = new Date().toISOString();
  const id = `${RESEARCH_PREFIX}${typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Date.now()}`;
  const note: EngineeringResearchNote = { id, query: query.trim(), createdAt, ...result };
  await db.appMetadata.put({
    id,
    value: note as unknown as Record<string, unknown>,
    updatedAt: createdAt,
  });
  return note;
}

export async function getEngineeringResearchHistory(limit = 20) {
  const rows = await db.appMetadata.filter((item) => item.id.startsWith(RESEARCH_PREFIX)).toArray();
  return rows
    .map((row) => row.value as unknown as EngineeringResearchNote)
    .filter((note) => typeof note?.query === 'string' && typeof note?.answer === 'string')
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export async function deleteEngineeringResearch(id: string) {
  if (!id.startsWith(RESEARCH_PREFIX)) return;
  await db.appMetadata.delete(id);
}
