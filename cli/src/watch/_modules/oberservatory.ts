import {DEV_OBSERVATORY_WASM_FILENAME} from '../../constants/dev.constants';
import {initObservatoryModule} from '../../modules/observatory';
import type {InitDynamicModuleResult} from '../../types/module';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const observatoryWatcher = new DeployWatcher({
  moduleFileName: DEV_OBSERVATORY_WASM_FILENAME,
  initModule: async (): Promise<InitDynamicModuleResult> => {
    const mod = initObservatoryModule();
    return {mod};
  }
});
