import {DEV_OBSERVATORY_WASM_FILENAME} from '../../constants/constants';
import {initObservatoryModule} from '../../modules/observatory';
import {WatcherDeploy} from '../services/watchers.services';

export const observatoryWatcher = new WatcherDeploy({
  moduleFileName: DEV_OBSERVATORY_WASM_FILENAME,
  initModule: initObservatoryModule
});
