import {DEV_SPUTNIK_MJS_FILENAME} from '../../constants/dev.constants';
import {initSatelliteModule} from '../../modules/satellite';
import {buildSputnik} from '../../services/sputnik.services';
import {BuildWatcher} from '../services/build.watcher';

export const sputnikWatcher = new BuildWatcher({
  moduleFileName: DEV_SPUTNIK_MJS_FILENAME,
  initModule: initSatelliteModule,
  build: buildSputnik
});
