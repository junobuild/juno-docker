import {DEV_OBSERVATORY_WASM_FILENAME} from '../../constants/constants';
import {initObservatoryModule} from '../../modules/observatory';
import {DeployWatcher} from '../services/deploy.watcher';

export const observatoryWatcher = new DeployWatcher({
  moduleFileName: DEV_OBSERVATORY_WASM_FILENAME,
  initModule: initObservatoryModule
});
