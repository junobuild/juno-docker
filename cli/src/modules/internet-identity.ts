import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const INTERNET_IDENTITY: ModuleDescription = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

export const internetIdentity = new Module(INTERNET_IDENTITY);
