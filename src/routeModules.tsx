import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type RouteModule = { default: ComponentType };
type RouteLoader = () => Promise<RouteModule>;

const routeLoaders = {
  '/': () => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
  '/missions': () =>
    import('@/pages/MissionsPage').then((module) => ({ default: module.MissionsPage })),
  '/status': () => import('@/pages/StatusPage').then((module) => ({ default: module.StatusPage })),
  '/challenges': () =>
    import('@/pages/ChallengesPage').then((module) => ({ default: module.ChallengesPage })),
  '/archive': () =>
    import('@/pages/ArchivePage').then((module) => ({ default: module.ArchivePage })),
  '/settings': () =>
    import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
  '/party-chat': () =>
    import('@/pages/PartyChatPage').then((module) => ({ default: module.PartyChatPage })),
  '/headquarters': () =>
    import('@/pages/HeadquartersPage').then((module) => ({ default: module.HeadquartersPage })),
  '/about': () => import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })),
  '/campaigns': () =>
    import('@/pages/CampaignsPage').then((module) => ({ default: module.CampaignsPage })),
  '/update-center': () =>
    import('@/pages/UpdateCenterPage').then((module) => ({ default: module.UpdateCenterPage })),
  '/treasury': () =>
    import('@/pages/TreasuryPage').then((module) => ({ default: module.TreasuryPage })),
  '/training-hall': () =>
    import('@/pages/TrainingHallPage').then((module) => ({ default: module.TrainingHallPage })),
  '/sanctuary': () =>
    import('@/pages/ScriptureSanctuaryPage').then((module) => ({
      default: module.ScriptureSanctuaryPage,
    })),
  '/kitchen': () =>
    import('@/pages/KitchenPage').then((module) => ({ default: module.KitchenPage })),
  '/creator-forge': () =>
    import('@/pages/CreatorForgePage').then((module) => ({ default: module.CreatorForgePage })),
  '/arc-archives': () =>
    import('@/pages/ArcArchivesPage').then((module) => ({ default: module.ArcArchivesPage })),
  '/calendar': () =>
    import('@/pages/CalendarPage').then((module) => ({ default: module.CalendarPage })),
  '/system-debrief': () =>
    import('@/pages/SystemDebriefPage').then((module) => ({ default: module.SystemDebriefPage })),
} satisfies Record<string, RouteLoader>;

export type AppRoutePath = keyof typeof routeLoaders;

export const PRIMARY_ROUTE_PATHS: AppRoutePath[] = [
  '/missions',
  '/status',
  '/training-hall',
  '/sanctuary',
  '/kitchen',
  '/treasury',
  '/archive',
  '/creator-forge',
  '/arc-archives',
  '/calendar',
];

const routePages = Object.fromEntries(
  Object.entries(routeLoaders).map(([path, loader]) => [path, lazy(loader)]),
) as Record<AppRoutePath, LazyExoticComponent<ComponentType>>;

function resolveRoute(path: string): AppRoutePath | undefined {
  const route = path.split('?')[0] as AppRoutePath;
  return route in routeLoaders ? route : undefined;
}

export function getRoutePage(path: string) {
  return routePages[resolveRoute(path) ?? '/'];
}

export async function preloadRoute(path: string) {
  const route = resolveRoute(path);
  if (!route) return;
  await routeLoaders[route]();
}
