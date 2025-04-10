import chokidar from 'chokidar';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {DEV_DEPLOY_FOLDER} from '../../constants/dev.constants';
import {buildContext} from '../../services/context.services';
import {watchers} from './watchers';

const {green, red} = kleur;

export const watchDeploy = async (args?: string[]) => {
  if (!existsSync(DEV_DEPLOY_FOLDER)) {
    console.log(
      `ℹ️  ${green(DEV_DEPLOY_FOLDER)} does not exist. Watching deployment files skipped.`
    );
    return;
  }

  console.log(`👀  Watching for deployment files.`);

  const context = await buildContext(args);

  const watchOnEvent = async (path: string) => {
    await Promise.allSettled(
      watchers.map(async (watcher) => {
        await watcher.onWatch({filePath: path, context});
      })
    );
  };

  chokidar
    .watch(DEV_DEPLOY_FOLDER, {
      ignoreInitial: true,
      awaitWriteFinish: true
    })
    .on('add', watchOnEvent)
    .on('change', watchOnEvent)
    .on('error', (err) => {
      console.log(red('️‼️  Unexpected error while live reloading:'), err);
    });
};
