import { access, cp, copyFile, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distributionDirectory = resolve(projectRoot, 'dist');
const clientDirectory = resolve(distributionDirectory, 'client');
const workerSource = resolve(projectRoot, 'worker', 'index.js');
const workerTarget = resolve(distributionDirectory, 'server', 'index.js');
const hostingTarget = resolve(distributionDirectory, '.openai', 'hosting.json');

await access(resolve(distributionDirectory, 'index.html'));
await access(workerSource);
await access(hostingTarget);

await rm(clientDirectory, { recursive: true, force: true });
await mkdir(clientDirectory, { recursive: true });

for (const entry of await readdir(distributionDirectory, { withFileTypes: true })) {
  if (entry.name === 'client' || entry.name === 'server' || entry.name === '.openai') continue;
  await cp(resolve(distributionDirectory, entry.name), resolve(clientDirectory, entry.name), {
    recursive: true,
  });
}

await mkdir(dirname(workerTarget), { recursive: true });
await copyFile(workerSource, workerTarget);

console.log('Sites deployment bundle prepared.');
