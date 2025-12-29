import {nonNullish, toNullable} from '@dfinity/utils';
import {decodeIcrcAccount, IcrcLedgerCanister} from '@icp-sdk/canisters/ledger/icrc';
import {AnonymousIdentity} from '@icp-sdk/core/agent';
import {Principal} from '@icp-sdk/core/principal';
import {createAgent} from '../../api/agent.api';
import {ICP_LEDGER_CANISTER_ID} from '../../modules/icp-ledger';
import type {CliContext} from '../../types/context';

export const transfer = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const {port} = context;

  const ledgerId = searchParams.get('ledgerId') ?? ICP_LEDGER_CANISTER_ID;

  // With PocketIC we can use the anonymous identity to get ICP from the ledger.
  const agent = await createAgent({
    identity: new AnonymousIdentity(),
    port
  });

  const {transfer} = IcrcLedgerCanister.create({
    agent,
    canisterId: Principal.fromText(ledgerId)
  });

  const to = searchParams.get('to') ?? '';
  const amount = searchParams.get('amount');

  const {owner, subaccount} = decodeIcrcAccount(to);

  await transfer({
    amount: nonNullish(amount) ? BigInt(amount) : 5_500_010_000n,
    to: {owner, subaccount: toNullable(subaccount)}
  });
};
