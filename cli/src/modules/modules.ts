import {nonNullish, notEmptyString} from '@dfinity/utils';
import type {Module} from '../services/modules/module.services';
import {consoleModule} from './console';
import {observatory} from './observatory';
import {satellite} from './satellite';

const MODULES = [satellite, consoleModule, observatory];

const filterModules = (modules: Module[]): Module[] =>
  (process.env.MODULES ?? '')
    .split(',')
    .filter((moduleKey) => notEmptyString(moduleKey))
    .map((moduleKey) => modules.find(({key}) => key === moduleKey.trim()))
    .filter((mod) => nonNullish(mod));

export const modules = filterModules(MODULES);
