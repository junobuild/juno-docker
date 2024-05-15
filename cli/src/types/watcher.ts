import type {Module} from '../services/modules.services';
import type {ModuleCanisterId} from './module';

export interface WatcherDescription {
  moduleFileName: string;
}

export type WatcherDeployDescription = {initModule: () => Module} & WatcherDescription;
export type WatcherConsoleInstallDescription = {
  key: string;
  name: string;
  consoleCanisterId: ModuleCanisterId;
} & WatcherDescription;
