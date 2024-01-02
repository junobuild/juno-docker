import type {HttpAgent, Identity} from '@dfinity/agent';
import type {CliConfig} from '../configs/cli.config';

export type ModuleStatus = 'initialized' | 'deployed';

export interface ModuleDetails {
  key: string;
  name: string;
  canisterId: string;
  status: ModuleStatus;
}

export type ModuleInitialDetail = Omit<ModuleDetails, 'canisterId' | 'status'> &
  Partial<Pick<ModuleDetails, 'canisterId'>>;

export interface ModuleParams {
  identity: Identity;
  agent: HttpAgent;
  config: CliConfig;
}

export interface Module {
  status: (params: ModuleParams) => ModuleStatus | undefined;
  init: (params: ModuleParams) => Promise<void>;
  deploy: (params: ModuleParams) => Promise<void>;
}
