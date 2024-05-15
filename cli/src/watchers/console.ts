import {
  DEV_CONSOLE_WASM_FILENAME,
  DEV_MISSION_CONTROL_WASM_FILENAME,
  DEV_ORBITER_WASM_FILENAME,
  DEV_SATELLITE_WASM_FILENAME
} from '../constants/constants';
import {CONSOLE_CANISTER_ID, initConsoleModule} from '../modules/console';
import {satellite} from '../modules/satellite';
import {WatcherConsoleInstall, WatcherDeploy} from '../services/watchers.services';

const consoleWatcher = new WatcherDeploy({
  moduleFileName: DEV_CONSOLE_WASM_FILENAME,
  initModule: initConsoleModule
});

const consoleSatelliteWatcher = new WatcherConsoleInstall({
  key: satellite.key,
  name: satellite.name,
  consoleCanisterId: CONSOLE_CANISTER_ID,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME
});

const consoleMissionControlWatcher = new WatcherConsoleInstall({
  key: 'mission-control',
  name: 'Mission Control',
  consoleCanisterId: CONSOLE_CANISTER_ID,
  moduleFileName: DEV_MISSION_CONTROL_WASM_FILENAME
});

const consoleOrbiterWatcher = new WatcherConsoleInstall({
  key: 'orbiter',
  name: 'Orbiter',
  consoleCanisterId: CONSOLE_CANISTER_ID,
  moduleFileName: DEV_ORBITER_WASM_FILENAME
});

export const consoleWatchers = [
  consoleWatcher,
  consoleSatelliteWatcher,
  consoleMissionControlWatcher,
  consoleOrbiterWatcher
];
