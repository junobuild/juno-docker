import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/constants';
import {initSatelliteModule} from '../../modules/satellite';
import {WatcherDeploy} from '../services/watchers.services';

export const satelliteWatcher = new WatcherDeploy({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteModule
});
