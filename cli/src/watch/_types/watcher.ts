import type {Module} from '../../services/modules.services';
import type {CliContext} from '../../types/context';
import type {ModuleDescription} from '../../types/module';

export interface WatcherDescription {
  moduleFileName: string;
  debounceDelay?: number;
}

export type WatcherDeployDescription = WatcherDescription & {
  initModule: (params: {context: CliContext}) => Promise<Module | undefined>;
};

export type WatcherJobDescription = Pick<ModuleDescription, 'key' | 'name'> & WatcherDescription;

export type WatcherConsoleInstallDescription = WatcherJobDescription;
export type WatcherBuildDescription = {
  build: () => Promise<void>;
} & WatcherConsoleInstallDescription;

export type WatcherConfigDescription = Omit<WatcherDescription, 'debounceDelay'> & {
  initModule: () => Module;
};
