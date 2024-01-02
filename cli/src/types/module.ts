import type {HttpAgent, Identity} from '@dfinity/agent';
import type {CliState} from '../states/cli.state';

export type ModuleStatus = 'initialized' | 'deployed';

export type ModuleCanisterId = string;

export interface ModuleMetadata {
  key: string;
  name: string;
  canisterId: ModuleCanisterId;
  status: ModuleStatus;
}

export type ModuleDescription = Omit<ModuleMetadata, 'canisterId' | 'status'> &
  Partial<Pick<ModuleMetadata, 'canisterId'>>;

export interface ModuleParams {
  identity: Identity;
  agent: HttpAgent;
  state: CliState;
}
