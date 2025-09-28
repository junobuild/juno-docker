import {assertNonNullish} from '@dfinity/utils';
import {nextArg} from '@junobuild/cli-tools';
import {EmulatorConfig, EmulatorConfigSchema, Network, NetworkServices} from '@junobuild/config';
import {readJunoConfig} from '../configs/juno.config';
import {
  ICP_CONFIG,
  INITIAL_TIME,
  INSTANCE_HTTP_GATEWAY,
  SUBNET_CONFIG
} from '../constants/pocket-ic.constants';
import {
  IcpFeature,
  IcpFeatures,
  IcpFeaturesSchema,
  InstanceConfig,
  InstanceConfigSchema
} from '../types/pocket-ic';

export const configPocketIC = async (args?: string[]) => {
  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});
  const stateDir = nextArg({args, option: '--state-dir'});

  assertNonNullish(port);
  assertNonNullish(stateDir);

  const config = await buildInstanceConfig({port, stateDir});

  // TODO curl
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

const loadEmulatorConfig = async (): Promise<EmulatorConfigWithNetwork> => {
  const DEFAULT_NETWORK_SERVICES: NetworkServices = {
    registry: false,
    cmc: true,
    icp: true,
    cycles: true,
    nns: true,
    sns: false,
    internet_identity: true,
    nns_dapp: false
  } as const;

  const SATELLITE_NETWORK_SERVICES: NetworkServices = {
    ...DEFAULT_NETWORK_SERVICES,
    cmc: false,
    cycles: false,
    nns: false
  } as const;

  const config = await readJunoConfig();

  const defaultServices =
    'satellite' in config ? SATELLITE_NETWORK_SERVICES : DEFAULT_NETWORK_SERVICES;

  const network: Network = {
    ...(config.emulator?.network ?? {}),
    services: {...defaultServices, ...(config.emulator?.network?.services ?? {})}
  };

  const emulator: EmulatorConfigWithNetwork = {
    ...(config.emulator ?? {
      skylab: {}
    }),
    network
  };

  EmulatorConfigSchema.parse(emulator);

  return emulator;
};
