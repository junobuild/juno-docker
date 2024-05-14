import {DEV_CONSOLE_WASM_FILENAME} from '../constants/constants';
import {console, initConsoleModule} from '../modules/console';
import {Watcher} from '../services/watchers.services';

export const consoleWatcher = new Watcher({
  key: console.key,
  moduleFileName: DEV_CONSOLE_WASM_FILENAME,
  initModule: initConsoleModule
});
