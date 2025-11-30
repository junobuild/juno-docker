import {OBSERVATORY_CANISTER_ID} from '../../modules/observatory';
import type {CliContext} from '../../types/context';
import {getObservatoryActor} from '../actor.services';

export const toggleOpenIdMonitoring = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const action = searchParams.get('action') ?? '';

  switch (action) {
    case 'start': {
      await startOpenIdMonitoring({context});
      return;
    }
    case 'stop': {
      await stopOpenIdMonitoring({context});
      return;
    }
    default:
      throw new Error('Unknown action provided for toggling OpenId monitoring');
  }
};

const startOpenIdMonitoring = async ({context}: {context: CliContext}) => {
  const {agent} = context;

  const {start_openid_monitoring} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await start_openid_monitoring();
  console.log('🟢 Observatory OpenId monitoring started.');
};

const stopOpenIdMonitoring = async ({context}: {context: CliContext}) => {
  const {agent} = context;

  const {stop_openid_monitoring} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await stop_openid_monitoring();
  console.log('🔴 Observatory OpenId monitoring stopped.');
};
