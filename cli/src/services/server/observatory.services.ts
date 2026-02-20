import {isEmptyString} from '@dfinity/utils';
import type {OpenIdProvider} from '../../declarations/observatory';
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
  const providerParam = searchParams.get('provider') ?? '';

  if (isEmptyString(providerParam)) {
    throw new Error('Cannot toggle OpenId monitoring for an unknown provider');
  }

  // "github" for backwards compatibility with the Console
  const provider: OpenIdProvider = ['github', 'gh_auth'].includes(providerParam)
    ? {GitHubAuth: null}
    : providerParam === 'gh_actions'
      ? {GitHubActions: null}
      : {Google: null};

  switch (action) {
    case 'start': {
      const alreadyEnabled = await isOpenIdMonitoringEnabled({context, provider});

      if (alreadyEnabled) {
        return;
      }

      await updateRateConfig({context});
      await startOpenIdMonitoring({context, provider});
      return;
    }
    case 'stop': {
      const alreadyDisabled = await isOpenIdMonitoringDisabled({context, provider});

      if (alreadyDisabled) {
        return;
      }

      await stopOpenIdMonitoring({context, provider});
      return;
    }
    default:
      throw new Error('Unknown action provided for toggling OpenId monitoring');
  }
};

const updateRateConfig = async ({context}: {context: CliContext}) => {
  const {agent} = context;

  const {set_rate_config} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await set_rate_config(
    {OpenIdCertificateRequests: null},
    {
      max_tokens: 300n, // allow up to 300 requests
      time_per_token_ns: 200_000_000n // 0.2s per token -> 300/min
    }
  );

  console.log('Rate config applied! ✅');
};

const isOpenIdMonitoringEnabled = async ({
  context,
  provider
}: {
  context: CliContext;
  provider: OpenIdProvider;
}): Promise<boolean> => {
  const {agent} = context;

  const {is_openid_monitoring_enabled} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  return await is_openid_monitoring_enabled(provider);
};

const isOpenIdMonitoringDisabled = async (params: {
  context: CliContext;
  provider: OpenIdProvider;
}): Promise<boolean> => !(await isOpenIdMonitoringEnabled(params));

const startOpenIdMonitoring = async ({
  context,
  provider
}: {
  context: CliContext;
  provider: OpenIdProvider;
}) => {
  const {agent} = context;

  const {start_openid_monitoring} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await start_openid_monitoring(provider);
  console.log('🟢 Observatory OpenId monitoring started.');
};

const stopOpenIdMonitoring = async ({
  context,
  provider
}: {
  context: CliContext;
  provider: OpenIdProvider;
}) => {
  const {agent} = context;

  const {stop_openid_monitoring} = await getObservatoryActor({
    agent,
    canisterId: OBSERVATORY_CANISTER_ID
  });

  await stop_openid_monitoring(provider);
  console.log('🔴 Observatory OpenId monitoring stopped.');
};
