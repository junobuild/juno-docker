import type {IcManagementDid} from '@icp-sdk/canisters/ic-management';

export const INSTALL_MODE_INSTALL: IcManagementDid.canister_install_mode = {install: null};

export const INSTALL_MODE_UPGRADE: IcManagementDid.canister_install_mode = {
  upgrade: [{skip_pre_upgrade: [false], wasm_memory_persistence: [{replace: null}]}]
};
