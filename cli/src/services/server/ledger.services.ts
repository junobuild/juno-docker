import {AnonymousIdentity} from '@dfinity/agent';
import {Principal} from '@dfinity/principal';
import {nonNullish} from '@dfinity/utils';
import {createAgent} from '../../api/agent.api';
import {ICP_LEDGER_CANISTER_ID} from '../../modules/icp-ledger';
import type {CliContext} from '../../types/context';
import {getLedgerActor} from '../actor.services';

export const transfer = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const {port} = context;

  const agent = await createAgent({
    identity: new AnonymousIdentity(),
    port
  });

  const {icrc1_transfer} = await getLedgerActor({
    agent,
    canisterId: ICP_LEDGER_CANISTER_ID
  });

  const to = searchParams.get('to') ?? '';
  const amount = searchParams.get('amount');

  await icrc1_transfer({
    amount: nonNullish(amount) ? BigInt(amount) : 5_500_010_000n,
    to: {owner: Principal.fromText(to), subaccount: []},
    fee: [],
    memo: [],
    from_subaccount: [],
    created_at_time: []
  });
};
