import {Module} from '../../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {prepareCmcArgs} from './cmc.install';

const CMC: ModuleDescription = {
  key: 'cmc',
  name: 'CMC',
  canisterId: 'rkp4c-7iaaa-aaaaa-aaaca-cai'
};

class CmcModule extends Module {
  override async install({state, identities, ...rest}: ModuleInstallParams): Promise<void> {
    const arg = prepareCmcArgs({identities, state});

    await super.install({
      state,
      arg,
      identities,
      ...rest
    });
  }
}

export const cmc = new CmcModule(CMC);
