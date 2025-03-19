import {
  DEV_CONSOLE_WASM_FILENAME,
  DEV_MISSION_CONTROL_WASM_FILENAME,
  DEV_ORBITER_WASM_FILENAME,
  DEV_SATELLITE_WASM_FILENAME
} from '../../constants/constants';
import {initConsoleModule} from '../../modules/console';
import {satellite} from '../../modules/satellite';
import {ConsoleInstallWatcher} from '../services/console-install.watcher';
import {DeployWatcher} from '../services/deploy.watcher';

const consoleWatcher = new DeployWatcher({
  moduleFileName: DEV_CONSOLE_WASM_FILENAME,
  // We require an arrow function here to avoid bundling issue with initConsoleModule being undefined on init.
  initModule: () => initConsoleModule()
});

const consoleSatelliteWatcher = new ConsoleInstallWatcher({
  key: satellite.key,
  name: satellite.name,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME
});

export const MISSION_CONTROL_KEY = 'mission_control';
export const MISSION_CONTROL_NAME = 'Mission Control';

const consoleMissionControlWatcher = new ConsoleInstallWatcher({
  key: MISSION_CONTROL_KEY,
  name: MISSION_CONTROL_NAME,
  moduleFileName: DEV_MISSION_CONTROL_WASM_FILENAME
});

export const ORBITER_KEY = 'orbiter';
export const ORBITER_NAME = 'Orbiter';

const consoleOrbiterWatcher = new ConsoleInstallWatcher({
  key: ORBITER_KEY,
  name: ORBITER_NAME,
  moduleFileName: DEV_ORBITER_WASM_FILENAME
});

export const consoleWatchers = [
  consoleWatcher,
  consoleSatelliteWatcher,
  consoleMissionControlWatcher,
  consoleOrbiterWatcher
];
