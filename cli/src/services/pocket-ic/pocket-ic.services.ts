import {assertNonNullish} from '@dfinity/utils';
import {nextArg} from '@junobuild/cli-tools';
import {
  DEFAULT_NETWORK_SERVICES,
  DEFAULT_SATELLITE_NETWORK_SERVICES,
  type EmulatorConfig,
  EmulatorConfigSchema,
  JunoConfig,
  type Network
} from '@junobuild/config';
import {readJunoConfig} from '../../configs/juno.config';
import {
  ICP_CONFIG,
  INITIAL_TIME,
  INSTANCE_HTTP_GATEWAY,
  SUBNET_CONFIG
} from '../../constants/pocket-ic.constants';
import {
  type IcpFeature,
  type IcpFeatures,
  IcpFeaturesSchema,
  type InstanceConfig,
  InstanceConfigSchema
} from '../../types/pocket-ic';
import {dispatchRequest} from './_request.services';

export const configPocketIC = async (args?: string[]) => {
  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});
  const replicaPort = nextArg({args, option: '--replica-port'});
  const stateDir = nextArg({args, option: '--state-dir'});

  assertNonNullish(port);
  assertNonNullish(replicaPort);
  assertNonNullish(stateDir);

  const config = await buildInstanceConfig({port, stateDir});

  const result = await dispatchRequest({
    replicaPort,
    request: 'instances',
    body: config
  });

  if (result.result === 'ok') {
    return;
  }

  if (result.result === 'not_ok') {
    const text = await result.response.text().catch(() => 'Unknown error');
    throw new Error(text);
  }

  throw result.err;
};

const buildInstanceConfig = async ({
  port,
  stateDir
}: {
  port: string;
  stateDir: string;
}): Promise<InstanceConfig> => {
  const config: InstanceConfig = {
    subnet_config_set: {
      nns: SUBNET_CONFIG,
      sns: SUBNET_CONFIG,
      ii: SUBNET_CONFIG,
      fiduciary: null,
      bitcoin: null,
      system: [],
      application: [SUBNET_CONFIG],
      verified_application: []
    },
    state_dir: stateDir,
    icp_config: ICP_CONFIG,
    initial_time: INITIAL_TIME,
    icp_features: await buildIcpFeatures(),
    http_gateway_config: {
      ...INSTANCE_HTTP_GATEWAY,
      port: parseInt(port)
    }
  };

  InstanceConfigSchema.parse(config);

  return config;
};

const buildIcpFeatures = async (): Promise<IcpFeatures> => {
  const {
    network: {
      services: {registry, cmc, icp, cycles, nns, sns, internet_identity, nns_dapp}
    }
  } = await loadEmulatorConfig();

  const mapIcpFeature = (service: boolean | undefined): IcpFeature | null =>
    service === true ? 'DefaultConfig' : null;

  const icpFeatures: IcpFeatures = {
    registry: mapIcpFeature(registry),
    cycles_minting: mapIcpFeature(cmc),
    icp_token: mapIcpFeature(icp),
    cycles_token: mapIcpFeature(cycles),
    nns_governance: mapIcpFeature(nns),
    sns: mapIcpFeature(sns),
    ii: mapIcpFeature(internet_identity),
    nns_ui: mapIcpFeature(nns_dapp)
  };

  return IcpFeaturesSchema.parse(icpFeatures);
};

type EmulatorConfigWithNetwork = Omit<EmulatorConfig, 'network'> &
  Required<Pick<EmulatorConfig, 'network'>>;

const readConfig = async (): Promise<{ok: JunoConfig} | {err: unknown}> => {
  try {
    const config = await readJunoConfig();
    return {ok: config};
  } catch (err: unknown) {
    return {err};
  }
};

const loadEmulatorConfig = async (): Promise<EmulatorConfigWithNetwork> => {
  const result = await readConfig();

  // Historically, before we used PocketIC to spin up canisters and dapps, it was possible
  // to run the container without providing a juno.config file. For that reason, we want
  // to preserve this capability.
  if ('err' in result) {
    console.log(`⚠️  No juno.config found. Falling back to default network services!`);

    return {
      network: {
        services: DEFAULT_NETWORK_SERVICES
      }
    };
  }

  const {ok: config} = result;

  const emulatorConfig = config.emulator ?? {
    skylab: {}
  };

  const defaultServices =
    'satellite' in emulatorConfig ? DEFAULT_SATELLITE_NETWORK_SERVICES : DEFAULT_NETWORK_SERVICES;

  const network: Network = {
    ...(config.emulator?.network ?? {}),
    services: {...defaultServices, ...(config.emulator?.network?.services ?? {})}
  };

  const emulator: EmulatorConfigWithNetwork = {
    ...emulatorConfig,
    network
  };

  EmulatorConfigSchema.parse(emulator);

  return emulator;
};
