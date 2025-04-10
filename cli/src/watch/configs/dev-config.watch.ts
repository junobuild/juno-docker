import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import {watch as fsWatch} from 'node:fs/promises';
import {junoDevConfigExist, junoDevConfigFile} from '../../configs/juno.dev.config';
import {initSatelliteModule} from '../../modules/satellite';
import {buildContext} from '../../services/context.services';
import type {CliContext} from '../../types/context';

export const watchDevConfig = async (args?: string[]) => {
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
  console.log(`🔧  Updating configuration...`);

  const mod = initSatelliteModule();

  await mod.config(context);
};

const debounceConfigSatellite = debounce(updateConfig, 5000);
