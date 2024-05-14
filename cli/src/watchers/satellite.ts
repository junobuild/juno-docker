import {DEV_SATELLITE_WASM_FILENAME} from '../constants/constants';
import {initSatelliteModule, satellite} from '../modules/satellite';
import {Watcher} from '../services/watchers.services';

export const satelliteWatcher = new Watcher({
  key: satellite.key,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteModule
});
