import {nonNullish, notEmptyString} from '@dfinity/utils';
import {cmc} from './cmc';
import {consoleModule} from './console';
import {governance} from './governance';
import {icpIndex} from './icp-index';
import {icpLedger} from './icp-ledger';
import {internetIdentity} from './internet-identity';
import {observatory} from './observatory';
import {satellite} from './satellite';

const MODULES = [
  internetIdentity,
  icpLedger,
  icpIndex,
  satellite,
  cmc,
  governance,
  consoleModule,
  observatory
];

export const modules = (process.env.MODULES ?? '')
  .split(',')
  .filter((moduleKey) => notEmptyString(moduleKey))
  .map((moduleKey) => MODULES.find(({key}) => key === moduleKey.trim()))
  .filter((mod) => nonNullish(mod));
