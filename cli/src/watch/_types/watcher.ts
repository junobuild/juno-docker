import type {Module} from '../../services/modules.services';
import type {ModuleDescription} from '../../types/module';

export interface WatcherDescription {
  moduleFileName: string;
  debounceDelay?: number;
}

export interface WatcherModuleDescription {
  initModule: () => Module;
}

export type WatcherDeployDescription = WatcherModuleDescription & WatcherDescription;

export type WatcherJobDescription = Pick<ModuleDescription, 'key' | 'name'> & WatcherDescription;

export type WatcherConsoleInstallDescription = WatcherJobDescription;
export type WatcherBuildDescription = {
  build: () => Promise<void>;
} & WatcherConsoleInstallDescription;

export type WatcherConfigDescription = WatcherDeployDescription;
