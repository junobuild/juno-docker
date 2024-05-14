import type {Module} from '../services/modules.services';
import type {ModuleDescription} from './module';

export type WatcherDescription = {moduleFileName: string; initModule: () => Module} & Pick<
  ModuleDescription,
  'key'
>;
