import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule, SATELLITE} from '../../modules/satellite';
import {initSatelliteDynamicModule} from '../../modules/satellite/dynamic';
import type {WatcherDeployInitModuleResult} from '../_types/watcher';
import {ConfigWatcher} from '../_watchers/config.watcher';
import {DeployWatcher} from '../_watchers/deploy.watcher';

export const satelliteWatcher = new DeployWatcher({
  key: SATELLITE.key,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: async (): Promise<WatcherDeployInitModuleResult> => {
    const mod = initSatelliteModule();
    return {mod};
  }
});

export const satelliteConfigWatcher = new ConfigWatcher({
  key: SATELLITE.key,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteModule
});

export const satelliteDynamicWatcher = new DeployWatcher({
  key: SATELLITE.key,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME,
  initModule: initSatelliteDynamicModule
});
