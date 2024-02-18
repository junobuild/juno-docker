import {IDL} from '@dfinity/candid';
import {Module} from '../services/modules.services';
import {ModuleDescription, ModuleInstallParams} from '../types/module';

const {Record, Variant, Nat64, Vec, Tuple, Principal, Opt, Text, encode} = IDL;

export const ICP_LEDGER: ModuleDescription = {
  key: 'icp_ledger',
  name: 'ICP Ledger',
  canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
};

export class IcpLedgerModule extends Module {
  override async install({identity, ...rest}: ModuleInstallParams): Promise<void> {
    const TextAccountIdentifier = Text;
    const Tokens = Record({e8s: Nat64});

    const arg = encode(
      [
        Record({
          minting_account: TextAccountIdentifier,
          initial_values: Vec(Tuple(TextAccountIdentifier, Tokens)),
          send_whitelist: Vec(Principal),
          transfer_fee: Opt(Tokens),
          token_symbol: Opt(Text),
          token_name: Opt(Text)
        })
      ],
      [{minting_account: [identity.getPrincipal()]}]
    );

    const arg = encode(
      [
        Variant({
          Init: Record({
            minting_account: Principal
          })
        })
      ],
      [{Init: {}}]
    );

    await super.install({identity, ...rest, arg});
  }
}

export const icpLedger = new IcpLedgerModule(ICP_LEDGER);
