import { access, copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distributionDirectory = resolve(projectRoot, 'dist');
const workerSource = resolve(projectRoot, 'worker', 'index.js');
const workerTarget = resolve(distributionDirectory, 'server', 'index.js');
const hostingTarget = resolve(distributionDirectory, '.openai', 'hosting.json');

await access(resolve(distributionDirectory, 'index.html'));
await access(workerSource);
await access(hostingTarget);
await mkdir(dirname(workerTarget), { recursive: true });
await copyFile(workerSource, workerTarget);

console.log('Sites deployment bundle prepared.');
