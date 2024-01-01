import {deploy} from '../services/deploy.services';
import {DeployParams, Plugin, SegmentDescription} from '../types/plugin';

const INTERNET_IDENTITY: SegmentDescription = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

export const internetIdentity: Plugin = {
  deploy: (params: DeployParams): Promise<void> => deploy({...params, ...INTERNET_IDENTITY})
};
