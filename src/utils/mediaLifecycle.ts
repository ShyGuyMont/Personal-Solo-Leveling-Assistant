type ReleaseMedia = () => void;

export function installMediaReleaseGuard(
  releaseMedia: ReleaseMedia,
  lifecycleDocument: Document = document,
  lifecycleWindow: Window = window,
) {
  const releaseWhenHidden = () => {
    if (lifecycleDocument.visibilityState === 'hidden') releaseMedia();
  };
  const releaseForPageExit = () => releaseMedia();

  lifecycleDocument.addEventListener('visibilitychange', releaseWhenHidden);
  lifecycleWindow.addEventListener('pagehide', releaseForPageExit);

  return () => {
    lifecycleDocument.removeEventListener('visibilitychange', releaseWhenHidden);
    lifecycleWindow.removeEventListener('pagehide', releaseForPageExit);
  };
}
