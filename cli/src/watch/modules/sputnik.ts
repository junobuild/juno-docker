import {initSatelliteModule} from '../../modules/satellite';
import {BuildWatcher} from '../services/build.watcher';
import {DEV_BUILD_SPUTNIK, DEV_SPUTNIK_MJS_FILENAME} from "../../constants/dev.constants";

export const sputnikWatcher = new BuildWatcher({
  moduleFileName: DEV_SPUTNIK_MJS_FILENAME,
  initModule: initSatelliteModule,
  buildCmd: DEV_BUILD_SPUTNIK
});
