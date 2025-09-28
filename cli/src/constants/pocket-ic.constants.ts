import type {IcpConfig, InitialTime, InstanceHttpGatewayConfig, SubnetSpec} from '../types/pocket-ic';

export const SUBNET_CONFIG: SubnetSpec = {
  state_config: 'New',
  instruction_config: 'Production'
};

// https://github.com/dfinity/ic/blob/master/packages/pocket-ic/src/common/rest.rs#L557
export const ICP_CONFIG: IcpConfig = {
  beta_features: 'Disabled',
  canister_backtrace: 'Enabled',
  function_name_length_limits: 'Enabled',
  canister_execution_rate_limiting: 'Enabled'
};

// We need the set up the HTTP gateway in the same call so that the NNS dapp can be configured with the right gateway URL
// https://github.com/dfinity/ic/blob/master/packages/pocket-ic/src/common/rest.rs#L603
export const INSTANCE_HTTP_GATEWAY: Omit<InstanceHttpGatewayConfig, 'port'> = {
  ip_addr: '0.0.0.0',
  domains: null,
  https_config: null
};

// Configures the instance to make progress automatically
// https://github.com/dfinity/ic/blob/master/packages/pocket-ic/src/common/rest.rs#L637
export const INITIAL_TIME: InitialTime = {AutoProgress: {artificial_delay_ms: null}};
