import {IDL} from '@dfinity/candid';

const {Record, Variant, Nat64, Nat32, Nat8, Bool, Vec, Tuple, Principal, Opt, Text, encode} = IDL;

const SubAccount = Vec(Nat8);
const Account = Record({
  owner: Principal,
  subaccount: Opt(SubAccount)
});
const FeatureFlags = Record({icrc2: Bool});
const UpgradeArgs = Record({
  maximum_number_of_accounts: Opt(Nat64),
  icrc1_minting_account: Opt(Account),
  feature_flags: Opt(FeatureFlags)
});
const Tokens = Record({e8s: Nat64});
const TextAccountIdentifier = Text;
const Duration = Record({secs: Nat64, nanos: Nat32});
const ArchiveOptions = Record({
  num_blocks_to_archive: Nat64,
  trigger_threshold: Nat64,
  max_message_size_bytes: Opt(Nat64),
  cycles_for_archive_creation: Opt(Nat64),
  node_max_memory_size_bytes: Opt(Nat64),
  controller_id: Principal
});
const InitArgs = IDL.Record({
  send_whitelist: IDL.Vec(IDL.Principal),
  token_symbol: IDL.Opt(IDL.Text),
  transfer_fee: IDL.Opt(Tokens),
  minting_account: TextAccountIdentifier,
  maximum_number_of_accounts: IDL.Opt(IDL.Nat64),
  accounts_overflow_trim_quantity: IDL.Opt(IDL.Nat64),
  transaction_window: IDL.Opt(Duration),
  max_message_size_bytes: IDL.Opt(IDL.Nat64),
  icrc1_minting_account: IDL.Opt(Account),
  archive_options: IDL.Opt(ArchiveOptions),
  initial_values: IDL.Vec(IDL.Tuple(TextAccountIdentifier, Tokens)),
  token_name: IDL.Opt(IDL.Text),
  feature_flags: IDL.Opt(FeatureFlags)
});
export const LedgerCanisterPayload = IDL.Variant({
  Upgrade: IDL.Opt(UpgradeArgs),
  Init: InitArgs
});
