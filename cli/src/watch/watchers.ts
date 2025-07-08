import {notEmptyString} from '@dfinity/utils';
import {consoleModule} from '../modules/console';
import {observatory} from '../modules/observatory';
import {satellite} from '../modules/satellite';
import type {ModuleKey} from '../types/module';
import {consoleWatchers} from './_modules/console';
import {observatoryWatcher} from './_modules/oberservatory';
import {
  satelliteConfigWatcher,
  satelliteDynamicWatcher,
  satelliteWatcher
} from './_modules/satellite';
import {sputnikWatcher} from './_modules/sputnik';
import type {Watcher} from './_watchers/_watcher';

interface WatcherKey {
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  key: ModuleKey | `${ModuleKey}-config` | `${ModuleKey}-dynamic` | 'sputnik';
  watcher: Watcher;
}

const WATCHERS: WatcherKey[] = [
  {
    key: satellite.key,
    watcher: satelliteWatcher
  },
  {
    key: `${satellite.key}-config`,
    watcher: satelliteConfigWatcher
  },
  {
    key: `${satellite.key}-dynamic`,
    watcher: satelliteDynamicWatcher
  },
  {
    key: 'sputnik',
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

const watchersKeys = (process.env.WATCHERS ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => moduleKey.trim());

export const watchers = WATCHERS.filter(({key}) => watchersKeys.includes(key)).map(
  ({watcher}) => watcher
);

export const watchSatellite = watchersKeys.find((key) => key === satellite.key) !== undefined;
