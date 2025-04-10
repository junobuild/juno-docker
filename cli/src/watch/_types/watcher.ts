import type {Module} from '../../services/modules.services';
import type {ModuleDescription} from '../../types/module';

export interface WatcherDescription {
  moduleFileName: string;
  debounceDelay?: number;
}

export type WatcherDeployDescription = WatcherDescription & {
  initModule: () => Promise<Module | undefined>;
};

export type WatcherJobDescription = Pick<ModuleDescription, 'key' | 'name'> & WatcherDescription;

export type WatcherConsoleInstallDescription = WatcherJobDescription;
export type WatcherBuildDescription = {
  build: () => Promise<void>;
} & WatcherConsoleInstallDescription;

export type WatcherConfigDescription = Omit<WatcherDescription, 'debounceDelay'> & {
  initModule: () => Module;
};
