import {IDL} from '@dfinity/candid';
import {AccountIdentifier} from '@junobuild/ledger';
import {MAIN_IDENTITY_KEY, MINTER_IDENTITY_KEY} from '../../constants/constants';
import {Module} from '../../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../../types/module';
import {LedgerCanisterPayload} from './icp-ledger.did';

export const ICP_LEDGER: ModuleDescription = {
  key: 'icp_ledger',
  name: 'ICP Ledger',
  canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
};

export class IcpLedgerModule extends Module {
  override async install(context: ModuleInstallParams): Promise<void> {
    const {
      identities: {
        [MINTER_IDENTITY_KEY]: minterIdentity,
        [MAIN_IDENTITY_KEY]: mainIdentity,
        ...otherIdentities
      },
      ...rest
    } = context;

    const minterAccountIdentifier = AccountIdentifier.fromPrincipal({
      principal: minterIdentity.getPrincipal()
    }).toHex();

    const ledgerAccountIdentifier = AccountIdentifier.fromPrincipal({
      principal: mainIdentity.getPrincipal()
    }).toHex();

    const initArgs = {
      send_whitelist: [],
      token_symbol: ['ICP'],
      transfer_fee: [{e8s: 10_000n}],
      minting_account: minterAccountIdentifier,
      maximum_number_of_accounts: [],
      accounts_overflow_trim_quantity: [],
      transaction_window: [],
      max_message_size_bytes: [],
      icrc1_minting_account: [],
      archive_options: [],
      initial_values: [[ledgerAccountIdentifier, {e8s: 100_000_000_000n}]],
      token_name: ['Internet Computer'],
      feature_flags: []
    };

    const upgradeArgs = [];

    const arg = IDL.encode(
      [LedgerCanisterPayload],
      [this.status(context) === 'deployed' ? {Upgrade: upgradeArgs} : {Init: initArgs}]
    );

    await super.install({
      identities: {
        [MINTER_IDENTITY_KEY]: minterIdentity,
        [MAIN_IDENTITY_KEY]: mainIdentity,
        ...otherIdentities
      },
      ...rest,
      arg
    });
  }
}

export const icpLedger = new IcpLedgerModule(ICP_LEDGER);
