import {HttpAgent, Identity} from '@dfinity/agent';
import {CliConfig} from '../configs/cli.config';

export type DeployModuleParams = {identity: Identity; agent: HttpAgent; config: CliConfig};

export interface ModuleDetails {
  key: string;
  name: string;
  canisterId: string;
}

export type ModuleInitialDetail = Omit<ModuleDetails, 'canisterId'> &
  Partial<Pick<ModuleDetails, 'canisterId'>>;

export interface Module {
  deploy: (params: DeployModuleParams) => Promise<void>;
}
