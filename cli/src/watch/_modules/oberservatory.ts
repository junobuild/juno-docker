import {DEV_OBSERVATORY_WASM_FILENAME} from '../../constants/dev.constants';
import {initObservatoryModule} from '../../modules/observatory';
import type {WatcherDeployInitModuleResult} from '../_types/watcher';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const observatoryWatcher = new DeployWatcher({
  moduleFileName: DEV_OBSERVATORY_WASM_FILENAME,
  initModule: async (): Promise<WatcherDeployInitModuleResult> => {
    const mod = initObservatoryModule();
    return {mod};
  }
});
