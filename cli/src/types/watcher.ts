import type {Module} from '../services/modules.services';
import type {ModuleDescription} from './module';

export interface WatcherDescription {
  moduleFileName: string;
}

export type WatcherDeployDescription = {initModule: () => Module} & WatcherDescription;

export type WatcherJobDescription = Pick<ModuleDescription, 'key' | 'name'> & WatcherDescription;

export type WatcherConsoleInstallDescription = WatcherJobDescription;
export type WatcherBuildDescription = {
  build: () => Promise<void>;
} & WatcherConsoleInstallDescription;
