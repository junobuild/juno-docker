import type {Module} from '../services/modules.services';

export interface WatcherDescription {
  moduleFileName: string;
}

export type WatcherDeployDescription = {initModule: () => Module} & WatcherDescription;
export type WatcherConsoleInstallDescription = {
  key: string;
  name: string;
} & WatcherDescription;
