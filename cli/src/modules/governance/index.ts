import {assertNonNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {Module} from '../../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {prepareGovernanceArgs} from './governance.install';
import {makeIcpXdrProposal} from './governance.post-install';

const {green, cyan} = kleur;

const GOVERNANCE: ModuleDescription = {
  key: 'governance',
  name: 'NNS Governance',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

class GovernanceModule extends Module {
  override async install({state, identities, ...rest}: ModuleInstallParams): Promise<void> {
    const args = prepareGovernanceArgs({identities});

    await super.install({
      state,
      arg: args.serializeBinary(),
      identities,
      ...rest
    });
  }

  override async postInstall(context: ModuleInstallParams): Promise<void> {
    await makeIcpXdrProposal(context);

    const {state} = context;

    const metadata = state.getModule(this.key);

    assertNonNullish(
      metadata,
      'Module has not been installed and therefore cannot be post-installed!'
    );

    const {name, canisterId} = metadata;

    console.log(`🫠  ${green(name)} post-install. ID: ${cyan(canisterId.toString())}`);
  }
}

export const governance = new GovernanceModule(GOVERNANCE);
