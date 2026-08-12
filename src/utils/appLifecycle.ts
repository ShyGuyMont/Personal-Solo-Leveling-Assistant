interface ResumeControllerOptions {
  minInactiveMs?: number;
  resumeDelayMs?: number;
  now?: () => number;
}

export function createAppResumeController(
  onResume: () => void,
  { minInactiveMs = 1_000, resumeDelayMs = 120, now = Date.now }: ResumeControllerOptions = {},
) {
  let inactiveSince: number | undefined;
  let resumeTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    markInactive() {
      inactiveSince ??= now();
    },
    resumeIfReady(visible: boolean) {
      if (!visible || inactiveSince === undefined) return;
      const inactiveFor = now() - inactiveSince;
      inactiveSince = undefined;
      if (inactiveFor < minInactiveMs) return;
      if (resumeTimer !== undefined) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        resumeTimer = undefined;
        onResume();
      }, resumeDelayMs);
    },
    dispose() {
      if (resumeTimer !== undefined) clearTimeout(resumeTimer);
      resumeTimer = undefined;
      inactiveSince = undefined;
    },
  };
}
