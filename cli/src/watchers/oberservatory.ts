import {DEV_OBSERVATORY_WASM_FILENAME} from '../constants/constants';
import {initObservatoryModule, observatory} from '../modules/observatory';
import {Watcher} from '../services/watchers.services';

export const observatoryWatcher = new Watcher({
  key: observatory.key,
  moduleFileName: DEV_OBSERVATORY_WASM_FILENAME,
  initModule: initObservatoryModule
});
