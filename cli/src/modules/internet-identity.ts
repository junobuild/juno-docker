import {Module} from '../services/modules.services';
import type {ModuleDescription} from '../types/module';

const INTERNET_IDENTITY: ModuleDescription = {
  key: 'internet_identity',
  name: 'Internet Identity',
  canisterId: 'rdmx6-jaaaa-aaaaa-aaadq-cai'
};

export const internetIdentity = new Module(INTERNET_IDENTITY);
