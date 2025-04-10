import type {ConfigFilename} from '@junobuild/config-loader';
import {
  junoConfigExist as junoConfigExistTools,
  junoConfigFile as junoConfigFileTools
} from '@junobuild/config-loader';
import chokidar from 'chokidar';
import kleur from 'kleur';
import {basename} from 'node:path';
import {JUNO_DEV_CONFIG_FILENAME} from '../constants/dev.constants';
import {initSatelliteModule} from '../modules/satellite';
import {buildContext} from '../services/context.services';
import type {WatcherDescription} from './_types/watcher';
import type {Watcher} from './_watchers/_watcher';
import {ConfigWatcher} from './_watchers/config.watcher';

const {red} = kleur;

export const watchDevConfig = async (args?: string[]) => {
  await watch({
    args,
    configFilename: JUNO_DEV_CONFIG_FILENAME,
    initWatcher: ({moduleFileName}: Pick<WatcherDescription, 'moduleFileName'>): ConfigWatcher =>
      new ConfigWatcher({
        moduleFileName,
        initModule: initSatelliteModule
      })
  });
};

const watch = async ({
  configFilename,
  args,
  initWatcher
}: {
  args?: string[];
  configFilename: ConfigFilename;
  initWatcher: (params: Pick<WatcherDescription, 'moduleFileName'>) => Watcher;
}) => {
  if (!(await junoConfigExistTools({filename: configFilename}))) {
    console.log(`ℹ️  No configuration file provided. Watching for config updates skipped.`);
    return;
  }

  console.log(`👀  Watching for config updates.`);

  const context = await buildContext(args);

  const {configPath} = junoConfigFileTools({filename: configFilename});

  const watcher = initWatcher({moduleFileName: basename(configPath)});

  const watchOnEvent = async (path: string) => {
    await watcher.onWatch({filePath: path, context});
  };

  chokidar
    .watch(configPath, {
      ignoreInitial: false,
      awaitWriteFinish: true
    })
    .on('add', watchOnEvent)
    .on('change', watchOnEvent)
    .on('error', (err) => {
      console.log(red('️‼️  Unexpected error while applying configuration:'), err);
    });
};
