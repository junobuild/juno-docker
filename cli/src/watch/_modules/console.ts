import {
  DEV_CONSOLE_WASM_FILENAME,
  DEV_MISSION_CONTROL_WASM_FILENAME,
  DEV_ORBITER_WASM_FILENAME,
  DEV_SATELLITE_WASM_FILENAME
} from '../../constants/dev.constants';
import {CONSOLE, initConsoleModule} from '../../modules/console';
import {
  MISSION_CONTROL_KEY,
  MISSION_CONTROL_NAME,
  ORBITER_KEY,
  ORBITER_NAME
} from '../../modules/console/console.constants';
import {SATELLITE} from '../../modules/satellite';
import type {WatcherDeployInitModuleResult} from '../_types/watcher';
import {ConsoleInstallWatcher} from '../_watchers/console-install.watcher';
import {DeployWatcher} from '../_watchers/deploy.watcher';

const consoleWatcher = new DeployWatcher({
  key: CONSOLE.key,
  moduleFileName: DEV_CONSOLE_WASM_FILENAME,
  // We require an arrow function here to avoid bundling issue with initConsoleModule being undefined on init.
  initModule: async (): Promise<WatcherDeployInitModuleResult> => {
    const mod = initConsoleModule();
    return {mod};
  }
});

const consoleSatelliteWatcher = new ConsoleInstallWatcher({
  key: SATELLITE.key,
  name: SATELLITE.name,
  moduleFileName: DEV_SATELLITE_WASM_FILENAME
});

const consoleMissionControlWatcher = new ConsoleInstallWatcher({
  key: MISSION_CONTROL_KEY,
  name: MISSION_CONTROL_NAME,
  moduleFileName: DEV_MISSION_CONTROL_WASM_FILENAME
});

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
