import type {CliContext} from './context';

export type ModuleStatus = 'initialized' | 'deployed';

export type ModuleCanisterId = string;

export interface ModuleMetadata {
  key: string;
  name: string;
  canisterId: ModuleCanisterId;
  status: ModuleStatus;
  hash: string;
}

export type ModuleDescription = Omit<ModuleMetadata, 'canisterId' | 'status' | 'hash'> &
  Partial<Pick<ModuleMetadata, 'canisterId'>> & {wasmPath?: string};

export type ModuleInstallParams = CliContext & {
  arg?: ArrayBuffer;
};
