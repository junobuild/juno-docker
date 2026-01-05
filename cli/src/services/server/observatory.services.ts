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
      const alreadyEnabled = await isOpenIdMonitoringEnabled({context});

      if (alreadyEnabled) {
        return;
      }

      await updateRateConfig({context});
      await startOpenIdMonitoring({context});
      return;
    }
    case 'stop': {
      const alreadyDisabled = await isOpenIdMonitoringDisabled({context});

      if (alreadyDisabled) {
        return;
      }

      await stopOpenIdMonitoring({context});
      return;
    }
    default:
      throw new Error('Unknown action provided for toggling OpenId monitoring');
  }
};

const updateRateConfig = async ({context}: {context: CliContext}) => {
  const {agent} = context;

  const {update_rate_config} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await update_rate_config(
    {OpenIdCertificateRequests: null},
    {
      max_tokens: 300n, // allow up to 300 requests
      time_per_token_ns: 200_000_000n // 0.2s per token -> 300/min
    }
  );

  console.log('Rate config applied! ✅');
};

const isOpenIdMonitoringEnabled = async ({context}: {context: CliContext}): Promise<boolean> => {
  const {agent} = context;

  const {is_openid_monitoring_enabled} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  return await is_openid_monitoring_enabled();
};

const isOpenIdMonitoringDisabled = async (params: {context: CliContext}): Promise<boolean> =>
  !(await isOpenIdMonitoringEnabled(params));

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
