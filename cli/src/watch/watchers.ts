import {notEmptyString} from '@dfinity/utils';
import {consoleModule} from '../modules/console';
import {observatory} from '../modules/observatory';
import type {ModuleKey} from '../types/module';
import {consoleWatchers} from './_modules/console';
import {observatoryWatcher} from './_modules/oberservatory';
import type {Watcher} from './_watchers/_watcher';

interface WatcherKey {
  key: ModuleKey;
  watcher: Watcher;
}

const WATCHERS: WatcherKey[] = [
  ...consoleWatchers.map((watcher) => ({
    key: consoleModule.key,
    watcher
  })),
  {
    key: observatory.key,
    watcher: observatoryWatcher
  }
];

const watchersKeys = (process.env.WATCHERS ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => moduleKey.trim());

export const watchers = WATCHERS.filter(({key}) => watchersKeys.includes(key)).map(
  ({watcher}) => watcher
);
