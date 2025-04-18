import type {HttpAgent, Identity} from '@dfinity/agent';
import type {MAIN_IDENTITY_KEY, MINTER_IDENTITY_KEY} from '../constants/constants';
import type {CliState} from '../states/cli.state';

export interface CliContext {
  identities: {[MAIN_IDENTITY_KEY]: Identity; [MINTER_IDENTITY_KEY]: Identity};
  agent: HttpAgent;
  state: CliState;
  port: string | undefined;
}
