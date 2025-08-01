import type {Module} from '../../services/modules/module.services';
import type {CliContext} from '../../types/context';
import type {ModuleDescription} from '../../types/module';

export interface WatcherDescription {
  moduleFileName: string;
  debounceDelay?: number;
}

export type WatcherDeployInitModuleResult = {mod: Module} | {err: unknown};

export type WatcherDeployInitModule = (params: {
  context: CliContext;
}) => Promise<WatcherDeployInitModuleResult>;

export type WatcherDeployDescription = WatcherDescription & {
  initModule: WatcherDeployInitModule;
};

export type WatcherJobDescription = Pick<ModuleDescription, 'key' | 'name'> & WatcherDescription;

export type WatcherConsoleInstallDescription = WatcherJobDescription;
export type WatcherBuildDescription = {
  build: () => Promise<void>;
} & WatcherConsoleInstallDescription;

export type WatcherConfigDescription = Omit<WatcherDescription, 'debounceDelay'> & {
  initModule: () => Module;
};
