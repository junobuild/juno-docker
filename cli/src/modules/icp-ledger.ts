import {IDL} from '@dfinity/candid';
import {AccountIdentifier} from '@junobuild/ledger';
import {MAIN_IDENTITY_KEY, MINTER_IDENTITY_KEY} from '../constants/constants';
import {Module} from '../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../types/module';

const {Record, Variant, Nat64, Vec, Tuple, Principal, Opt, Text, encode} = IDL;

export const ICP_LEDGER: ModuleDescription = {
  key: 'icp_ledger',
  name: 'ICP Ledger',
  canisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai'
};

export class IcpLedgerModule extends Module {
  override async install({
    identities: {
      [MINTER_IDENTITY_KEY]: minterIdentity,
      [MAIN_IDENTITY_KEY]: mainIdentity,
      ...otherIdentities
    },
    ...rest
  }: ModuleInstallParams): Promise<void> {
    const TextAccountIdentifier = Text;
    const Tokens = Record({e8s: Nat64});

    const minterAccountIdentifier = AccountIdentifier.fromPrincipal({
      principal: minterIdentity.getPrincipal()
    }).toHex();

    const ledgerAccountIdentifier = AccountIdentifier.fromPrincipal({
      principal: mainIdentity.getPrincipal()
    }).toHex();

    const arg = encode(
      [
        Variant({
          Init: Record({
            minting_account: TextAccountIdentifier,
            initial_values: Vec(Tuple(TextAccountIdentifier, Tokens)),
            send_whitelist: Vec(Principal),
            transfer_fee: Opt(Tokens),
            token_symbol: Opt(Text),
            token_name: Opt(Text)
          })
        })
      ],
      [
        {
          Init: {
            minting_account: minterAccountIdentifier,
            initial_values: [[ledgerAccountIdentifier, {e8s: 100_000_000_000n}]],
            send_whitelist: [],
            transfer_fee: [{e8s: 10_000n}],
            token_symbol: ['ICP'],
            token_name: ['Internet Computer']
          }
        }
      ]
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
