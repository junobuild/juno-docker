import {notEmptyString} from '@dfinity/utils';
import {consoleModule} from '../modules/console';
import {observatory} from '../modules/observatory';
import {satellite} from '../modules/satellite';
import type {ModuleKey} from '../types/module';
import {consoleWatchers} from './modules/console';
import {observatoryWatcher} from './modules/oberservatory';
import {satelliteWatcher} from './modules/satellite';
import type {Watcher} from './services/_watcher';
import {sputnikWatcher} from "./modules/sputnik";

interface WatcherKey {
  key: ModuleKey;
  watcher: Watcher;
}

const WATCHERS: WatcherKey[] = [
  {
    key: satellite.key,
    watcher: satelliteWatcher
  },
  {
    key: satellite.key,
    watcher: sputnikWatcher
  },
  ...consoleWatchers.map((watcher) => ({
    key: consoleModule.key,
    watcher
  })),
  {
    key: observatory.key,
    watcher: observatoryWatcher
  }
];

const watchersKeys = (process.env.MODULES ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => moduleKey.trim());

export const watchers = WATCHERS.filter(({key}) => watchersKeys.includes(key)).map(
  ({watcher}) => watcher
);
