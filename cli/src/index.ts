import kleur from 'kleur';
import {version as cliCurrentVersion} from '../package.json';
import {deploy} from './commands/deploy';
import {adminServer} from './commands/server';
import {start} from './commands/start';
import {wait} from './commands/wait';
import {watch} from './commands/watch';
import {checkNodeVersion} from './utils/env.utils';

const {red, yellow} = kleur;

export const run = async () => {
  const {valid} = checkNodeVersion();

  if (!valid) {
    process.exit(1);
  }

  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case 'deploy':
      await deploy(args);
      break;
    case 'start':
      await start(args);
      break;
    case 'wait':
      await wait(args);
      break;
    case 'watch':
      await watch(args);
      break;
    case 'admin':
      await adminServer(args);
      break;
    case 'version':
      console.log(`CLI v${yellow(cliCurrentVersion)}`);
      break;
    default:
      throw new Error('Unknown command.');
  }
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
  try {
    await run();
  } catch (err: unknown) {
    console.log(red('⚠️  CLI Error:'), err);
  }
})();
