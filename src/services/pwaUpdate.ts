type UpdateHandler = (reloadPage?: boolean) => Promise<void>;
type Listener = () => void;

let updateAvailable = false;
let offlineReady = false;
let checking = false;
let lastCheckedAt: string | undefined;
let checkMessage = '';
let updateHandler: UpdateHandler | undefined;
let serviceWorkerRegistration: ServiceWorkerRegistration | undefined;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function configurePwaUpdate(handler: UpdateHandler) {
  updateHandler = handler;
}

export function configurePwaRegistration(registration: ServiceWorkerRegistration | undefined) {
  serviceWorkerRegistration = registration;
  emit();
}

export function markUpdateAvailable() {
  updateAvailable = true;
  checking = false;
  checkMessage = 'A new System release is ready to install.';
  lastCheckedAt = new Date().toISOString();
  emit();
}

export function markOfflineReady() {
  offlineReady = true;
  emit();
}

export function getPwaUpdateState() {
  return {
    updateAvailable,
    offlineReady,
    checking,
    lastCheckedAt,
    checkMessage,
    serviceReady: Boolean(serviceWorkerRegistration),
  };
}

export function subscribeToPwaUpdate(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function installPwaUpdate() {
  if (!updateHandler) throw new Error('The update service is not ready yet.');
  await updateHandler(true);
}

export async function checkForPwaUpdate() {
  if (!navigator.onLine) {
    checkMessage = 'You are offline. The installed version remains available.';
    emit();
    return false;
  }
  if (!serviceWorkerRegistration) {
    checkMessage = 'The update service is still initializing. Try again in a moment.';
    emit();
    return false;
  }
  checking = true;
  checkMessage = 'Checking the release channel…';
  emit();
  try {
    await serviceWorkerRegistration.update();
    lastCheckedAt = new Date().toISOString();
    if (!updateAvailable) checkMessage = 'The installed System release is current.';
    return updateAvailable;
  } catch {
    checkMessage = 'The release channel could not be reached. Your installed app is unaffected.';
    return false;
  } finally {
    checking = false;
    emit();
  }
}
