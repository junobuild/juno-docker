import {nonNullish, notEmptyString} from '@dfinity/utils';
import type {Watcher} from '../services/watchers.services';
import {consoleWatcher} from './console';
import {observatoryWatcher} from './oberservatory';
import {satelliteWatcher} from './satellite';

const WATCHERS = [satelliteWatcher, consoleWatcher, observatoryWatcher];

export const watchers = (process.env.MODULES ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => WATCHERS.find(({key}) => key === moduleKey.trim()))
  .filter((watcher) => nonNullish(watcher)) as Watcher[];
