import {assertNonNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {Module} from '../../services/modules/module.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {prepareCmcArgs} from './cmc.install';
import {makeAuthorizedSubnetworksProposal} from './cmc.post-install';

const {green, cyan} = kleur;

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

  override async postInstall(context: ModuleInstallParams): Promise<void> {
    await makeAuthorizedSubnetworksProposal(context);

    const {state} = context;

    const metadata = state.getModule(this.key);

    assertNonNullish(
      metadata,
      'Module has not been installed and therefore cannot be post-installed!'
    );

    const {name, canisterId} = metadata;

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion
    console.log(`🫠  ${green(name)} post-install. ID: ${cyan(canisterId.toString())}`);
  }
}

export const cmc = new CmcModule(CMC);
