import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule} from '../../modules/satellite';
import {initSatelliteDynamicModule} from '../../modules/satellite/init';
import type {Module} from '../../services/modules.services';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const satelliteWatcher = new DeployWatcher({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: async (): Promise<Module> => initSatelliteModule()
});

export const satelliteDynamicWatcher = new DeployWatcher({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteDynamicModule
});
