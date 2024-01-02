import {deploy, init, status} from '../services/deploy.services';
import type {Module, ModuleInitialDetail, ModuleParams, ModuleStatus} from '../types/module';

const INTERNET_IDENTITY: ModuleInitialDetail = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

export const internetIdentity: Module = {
  status: (params: ModuleParams): ModuleStatus | undefined =>
    status({...params, ...INTERNET_IDENTITY}),
  init: async (params: ModuleParams): Promise<void> => {
    await init({...params, ...INTERNET_IDENTITY});
  },
  deploy: async (params: ModuleParams): Promise<void> => {
    await deploy({...params, ...INTERNET_IDENTITY});
  }
};
