import {nonNullish, notEmptyString} from '@dfinity/utils';
import {Module} from '../services/modules.services';
import {cmc} from './cmc';
import {governance} from './governance';
import {icpIndex} from './icp-index';
import {icpLedger} from './icp-ledger';
import {internetIdentity} from './internet-identity';
import {satellite} from './satellite';

const MODULES = [internetIdentity, icpLedger, icpIndex, satellite, cmc, governance];

export const modules = (process.env.MODULES ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => MODULES.find(({key}) => key === moduleKey.trim()))
  .filter((mod) => nonNullish(mod)) as Module[];
