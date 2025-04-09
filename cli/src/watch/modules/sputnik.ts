import {DEV_SPUTNIK_MJS_FILENAME} from '../../constants/dev.constants';
import {satellite} from '../../modules/satellite';
import {buildSputnik} from '../../services/sputnik.services';
import {BuildWatcher} from '../services/build.watcher';

export const sputnikWatcher = new BuildWatcher({
  moduleFileName: DEV_SPUTNIK_MJS_FILENAME,
  key: satellite.key,
  name: satellite.name,
  build: buildSputnik
});
