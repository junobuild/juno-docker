import type {
  IcpConfig,
  IncompleteState,
  InitialTime,
  InstanceHttpGatewayConfig,
  SubnetSpec
} from '../types/pocket-ic';

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

// An additional optional field to specify if incomplete state (e.g., resulting from not deleting a PocketIC instance gracefully) is allowed.
// The drawback of enabling incomplete state is that messages and their effects on canister state might be lost in an incomplete state.
// In other words, we might miss the last update calls executed before stopping the emulator but, that's worth the price
// of not getting a corrupted state if deleting the instance on stop would not complete gracefully.
// https://github.com/dfinity/ic/blob/master/packages/pocket-ic/src/common/rest.rs#L621
// https://forum.dfinity.org/t/pocketic-version-10-0-0-bootstrapping-system-canisters/57413?u=peterparker
export const INCOMPLETE_STATE: IncompleteState = 'Enabled';
