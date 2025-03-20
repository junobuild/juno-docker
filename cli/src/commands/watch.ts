import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {watch as fsWatch} from 'node:fs/promises';
import {junoDevConfigExist, junoDevConfigFile} from '../configs/juno.dev.config';
import {DEV_DEPLOY_FOLDER} from '../constants/dev.constants';
import {initSatelliteModule} from '../modules/satellite';
import {buildContext} from '../services/context.services';
import type {CliContext} from '../types/context';
import {watchers} from '../watch/watchers';

const {green} = kleur;

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), watchConfig(args)]);
};

const watchConfig = async (args?: string[]) => {
  if (!(await junoDevConfigExist())) {
    console.log(`ℹ️  No configuration file provided. Watching for config updates skipped.`);
    return;
  }

  console.log(`👀  Watching for config updates.`);

  const context = await buildContext(args);

  const {configPath} = junoDevConfigFile();

  const watcher = fsWatch(configPath);
  for await (const $event of watcher) {
    await onConfigFileWatch({$event, context});
  }
};

const onConfigFileWatch = async ({
  $event: {eventType},
  context
}: {
  $event: FileChangeInfo<string>;
  context: CliContext;
}) => {
  if (eventType !== 'change') {
    return;
  }

  debounceConfigSatellite({context});
};

const updateConfig = async ({context}: {context: CliContext}) => {
  console.log(`🎬  New config detected. Starting update of the configuration.`);

  const mod = initSatelliteModule();

  await mod.config(context);
};

const debounceConfigSatellite = debounce(updateConfig, 5000);

const watchDeploy = async (args?: string[]) => {
  if (!existsSync(DEV_DEPLOY_FOLDER)) {
    console.log(
      `ℹ️  ${green(DEV_DEPLOY_FOLDER)} does not exist. Watching deployment files skipped.`
    );
    return;
  }

  console.log(`👀  Watching for deployment files.`);

  const context = await buildContext(args);

  const watcher = fsWatch(DEV_DEPLOY_FOLDER);
  for await (const $event of watcher) {
    await Promise.allSettled(
      watchers.map(async (watcher) => {
        await watcher.onWatch({$event, context});
      })
    );
  }
};
