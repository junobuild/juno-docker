import {nonNullish, notEmptyString} from '@dfinity/utils';
import type {Module} from '../services/modules.services';
import {cmc} from './cmc';
import {consoleModule} from './console';
import {governance} from './governance';
import {icpIndex} from './icp-index';
import {icpLedger} from './icp-ledger';
import {internetIdentity} from './internet-identity';
import {observatory} from './observatory';
import {satellite} from './satellite';

const MODULES = [internetIdentity, icpLedger, icpIndex, satellite, consoleModule, observatory];

// Canisters that require other modules (like the ledger) to be installed first
// before they can be initialized. Still a mystery how they were deployed at genesis...
//
// Also, the order matters. For example:
// - The CMC must be available when the Governance canister is installed.
// - The Governance must be available when the CMC post-install runs.
// - The CMC post-install must runs before the Governance one.
//
// Yolo
const TROUBLEMAKERS = [cmc, governance];

const filterModules = (modules: Module[]): Module[] =>
  (process.env.MODULES ?? '')
    .split(',')
    .filter((moduleKey) => notEmptyString(moduleKey))
    .map((moduleKey) => modules.find(({key}) => key === moduleKey.trim()))
    .filter((mod) => nonNullish(mod));

export const modules = filterModules(MODULES);
export const troublemakers = filterModules(TROUBLEMAKERS);
