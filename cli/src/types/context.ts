import type {HttpAgent, Identity} from '@dfinity/agent';
import type {CliState} from '../states/cli.state';

export interface CliContext {
  identity: Identity;
  agent: HttpAgent;
  state: CliState;
}
