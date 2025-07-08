import {DEV_SPUTNIK_MJS_FILENAME} from '../../constants/dev.constants';
import {SATELLITE} from '../../modules/satellite';
import {buildSputnik} from '../../services/sputnik.services';
import {BuildWatcher} from '../_watchers/build.watcher';

export const sputnikWatcher = new BuildWatcher({
  moduleFileName: DEV_SPUTNIK_MJS_FILENAME,
  key: SATELLITE.key,
  name: SATELLITE.name,
  build: buildSputnik
});
