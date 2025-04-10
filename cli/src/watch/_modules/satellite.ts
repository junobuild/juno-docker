import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule} from '../../modules/satellite';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const satelliteWatcher = new DeployWatcher({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteModule
});
