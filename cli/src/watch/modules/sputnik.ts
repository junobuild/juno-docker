import {DEV_BUILD_SPUTNIK, DEV_SPUTNIK_MJS_FILENAME} from '../../constants/build.constants';
import {initSatelliteModule} from '../../modules/satellite';
import {BuildWatcher} from '../services/build.watcher';

export const sputnikWatcher = new BuildWatcher({
  moduleFileName: DEV_SPUTNIK_MJS_FILENAME,
  initModule: initSatelliteModule,
  buildCmd: DEV_BUILD_SPUTNIK
});
