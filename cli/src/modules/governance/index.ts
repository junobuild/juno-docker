import {Module} from '../../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {prepareGovernanceArgs} from './governance.install';
import {makeIcpXdrProposal} from './governance.post-install';

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
  }
}

export const governance = new GovernanceModule(GOVERNANCE);
