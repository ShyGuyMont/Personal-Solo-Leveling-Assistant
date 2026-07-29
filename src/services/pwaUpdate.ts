type UpdateHandler = (reloadPage?: boolean) => Promise<void>;
type Listener = () => void;

let updateAvailable = false;
let offlineReady = false;
let updateHandler: UpdateHandler | undefined;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function configurePwaUpdate(handler: UpdateHandler) {
  updateHandler = handler;
}

export function markUpdateAvailable() {
  updateAvailable = true;
  emit();
}

export function markOfflineReady() {
  offlineReady = true;
  emit();
}

export function getPwaUpdateState() {
  return { updateAvailable, offlineReady };
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
