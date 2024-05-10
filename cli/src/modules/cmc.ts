import {IDL} from '@dfinity/candid';
import {Principal} from '@dfinity/principal';
import {assertNonNullish} from '@dfinity/utils';
import {AccountIdentifier} from '@junobuild/ledger';
import {MINTER_IDENTITY_KEY} from '../constants/constants';
import {init} from '../declarations/cmc.idl';
import {Module} from '../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../types/module';

const CMC: ModuleDescription = {
  key: 'cmc',
  name: 'CMC',
  canisterId: 'rkp4c-7iaaa-aaaaa-aaaca-cai'
};

class CmcModule extends Module {
  override async install({state, identities, ...rest}: ModuleInstallParams): Promise<void> {
    const canisterId = state.getModule('icp_ledger')?.canisterId;

    assertNonNullish(canisterId, 'Cannot configure CMC because the ICP ledger id is unknown.');

    const {[MINTER_IDENTITY_KEY]: minterIdentity} = identities;

    const minterAccountIdentifier = AccountIdentifier.fromPrincipal({
      principal: minterIdentity.getPrincipal()
    });

    const sourceArg = {
      exchange_rate_canister: [],
      last_purged_notification: [0],
      governance_canister_id: [Principal.fromText('aaaaa-aa')],
      minting_account_id: [{bytes: minterAccountIdentifier.toUint8Array()}],
      ledger_canister_id: [Principal.fromText(canisterId)]
    };

    // Type definitions generated by Candid are not clean enough.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const arg = IDL.encode(init({IDL}), [[sourceArg]]);

    await super.install({
      state,
      arg,
      identities,
      ...rest
    });
  }
}

export const cmc = new CmcModule(CMC);