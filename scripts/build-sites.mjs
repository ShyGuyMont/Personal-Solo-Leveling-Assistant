import { access, cp, copyFile, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distributionDirectory = resolve(projectRoot, 'dist');
const clientDirectory = resolve(distributionDirectory, 'client');
const workerSource = resolve(projectRoot, 'worker', 'index.js');
const workerTarget = resolve(distributionDirectory, 'server', 'index.js');
const hostingTarget = resolve(distributionDirectory, '.openai', 'hosting.json');
const serviceWorkerSource = resolve(distributionDirectory, 'sw.js');
const packageManifest = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
const releaseSource = await readFile(resolve(projectRoot, 'src', 'config', 'release.ts'), 'utf8');
const workerSourceText = await readFile(workerSource, 'utf8');

if (
  !releaseSource.includes(`APP_VERSION = '${packageManifest.version}'`) ||
  !workerSourceText.includes(`APP_RELEASE_VERSION = '${packageManifest.version}'`)
) {
  throw new Error('The client, release channel, and package versions must match before publishing.');
}

await access(resolve(distributionDirectory, 'index.html'));
await access(workerSource);
await access(hostingTarget);
await access(serviceWorkerSource);

const distributionEntries = await readdir(distributionDirectory, { withFileTypes: true });
const workboxRuntime = distributionEntries.find(
  (entry) => entry.isFile() && /^workbox-[a-zA-Z0-9_-]+\.js$/.test(entry.name),
);

if (!workboxRuntime) {
  throw new Error('The production service-worker runtime is missing from the deployment build.');
}

await rm(clientDirectory, { recursive: true, force: true });
await mkdir(clientDirectory, { recursive: true });

for (const entry of distributionEntries) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await cp(resolve(distributionDirectory, entry.name), resolve(clientDirectory, entry.name), {
    recursive: true,
  });
}

await access(resolve(clientDirectory, 'sw.js'));
await access(resolve(clientDirectory, workboxRuntime.name));

await mkdir(dirname(workerTarget), { recursive: true });
await copyFile(workerSource, workerTarget);

console.log('Sites deployment bundle prepared.');
