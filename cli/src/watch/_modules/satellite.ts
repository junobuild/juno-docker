import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule} from '../../modules/satellite';
import {initSatelliteDynamicModule} from '../../modules/satellite/dynamic';
import type {WatcherDeployInitModuleResult} from '../_types/watcher';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const satelliteWatcher = new DeployWatcher({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: async (): Promise<WatcherDeployInitModuleResult> => {
    const mod = initSatelliteModule();
    return {mod};
  }
});

export const satelliteDynamicWatcher = new DeployWatcher({
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteDynamicModule
});
