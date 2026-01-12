import { spawn } from 'node:child_process';

// CI calls: npm test -- --ci --coverage --maxWorkers=2
// This repo doesn't use Jest/Vitest yet, so we ignore those flags and run Node's built-in test runner.

const args = process.argv.slice(2);
void args; // ignore

const run = (cmd, cmdArgs) =>
  new Promise((resolve) => {
    const child = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('exit', (code) => resolve(code ?? 1));
  });

// Compile TS so tests can import from dist/
const buildExitCode = await run(process.execPath, ['./node_modules/typescript/bin/tsc']);
if (buildExitCode !== 0) {
  process.exit(buildExitCode);
}

// Run Node tests (JS/MJS files under test/)
const testExitCode = await run(process.execPath, ['--test', 'test']);
process.exit(testExitCode);
