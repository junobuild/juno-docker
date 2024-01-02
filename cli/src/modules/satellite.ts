import {Module} from '../services/modules.services';
import type {ModuleInitialDetail} from '../types/module';

const SATELLITE: ModuleInitialDetail = {
  key: 'satellite',
  name: 'Satellite'
};

export const satellite = new Module(SATELLITE);
