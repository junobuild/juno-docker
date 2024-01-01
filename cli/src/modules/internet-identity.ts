import {deploy} from '../services/deploy.services';
import {DeployModuleParams, Module, ModuleInitialDetail} from '../types/module';

const INTERNET_IDENTITY: ModuleInitialDetail = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

export const internetIdentity: Module = {
  deploy: (params: DeployModuleParams): Promise<void> => deploy({...params, ...INTERNET_IDENTITY})
};
