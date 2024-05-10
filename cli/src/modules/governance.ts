import {IDL} from '@dfinity/candid';
import type {Governance, NetworkEconomics, NeuronsFundEconomics} from '../declarations/governance';
import {init} from '../declarations/governance.idl';
import {Module} from '../services/modules.services';
import type {ModuleDescription, ModuleInstallParams} from '../types/module';

const GOVERNANCE: ModuleDescription = {
  key: 'governance',
  name: 'NNS Governance',
  canisterId: 'rrkah-fqaaa-aaaaa-aaaaq-cai'
};

class GovernanceModule extends Module {
  override async install({state, identities, ...rest}: ModuleInstallParams): Promise<void> {
    // Source: https://github.com/dfinity/ic/blob/e90838a1687f8e0869d85343aac2845d883f74ff/rs/nns/governance/src/governance.rs#L231
    const E8S_PER_ICP = 100_000_000n;
    const DEFAULT_TRANSFER_FEE = 10_000n;

    const neurons_fund_economics: NeuronsFundEconomics = {
      max_theoretical_neurons_fund_participation_amount_xdr: [
        {
          human_readable: ['750_000.0']
        }
      ],
      neurons_fund_matched_funding_curve_coefficients: [
        {
          contribution_threshold_xdr: [
            {
              human_readable: ['75_000.0']
            }
          ],
          one_third_participation_milestone_xdr: [
            {
              human_readable: ['225_000.0']
            }
          ],
          full_participation_milestone_xdr: [
            {
              human_readable: ['375_000.0']
            }
          ]
        }
      ],
      minimum_icp_xdr_rate: [
        {
          basis_points: [10_000n] // 1:1
        }
      ],
      maximum_icp_xdr_rate: [
        {
          basis_points: [1_000_000n] // // 1:100
        }
      ]
    };

    const economics: NetworkEconomics = {
      reject_cost_e8s: E8S_PER_ICP, // 1 ICP
      neuron_minimum_stake_e8s: E8S_PER_ICP, // 1 ICP
      neuron_management_fee_per_proposal_e8s: 1_000_000n, // 0.01 ICP
      minimum_icp_xdr_rate: 100n, // 1 XDR
      neuron_spawn_dissolve_delay_seconds: BigInt(24 * 60 * 60 * 7), // 7 days
      maximum_node_provider_rewards_e8s: BigInt(1_000_000 * 100_000_000), // 1M ICP,
      transaction_fee_e8s: DEFAULT_TRANSFER_FEE,
      max_proposals_to_keep_per_topic: 100,
      neurons_fund_economics: [neurons_fund_economics]
    };

    const sourceArg: Governance = {
      neurons: [],
      proposals: [],
      to_claim_transfers: [],
      wait_for_quiet_threshold_seconds: BigInt(60 * 60 * 24 * 4), // 4 days
      economics: [economics],
      latest_reward_event: [],
      in_flight_commands: [],
      genesis_timestamp_seconds: 1n,
      node_providers: [],
      default_followees: [],
      short_voting_period_seconds: BigInt(60 * 60 * 12), // 12 hours
      metrics: [],
      most_recent_monthly_node_provider_rewards: [],
      cached_daily_maturity_modulation_basis_points: [],
      maturity_modulation_last_updated_at_timestamp_seconds: [],
      spawning_neurons: [false],
      making_sns_proposal: [],
      migrations: [],
      topic_followee_index: [],
      neuron_management_voting_period_seconds: [],
      xdr_conversion_rate: [
        {
          timestamp_seconds: [1n],
          xdr_permyriad_per_icp: [10_000n]
        }
      ],
      restore_aging_summary: []
    };

    // Type definitions generated by Candid are not clean enough.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const arg = IDL.encode(init({IDL}), [sourceArg]);

    await super.install({
      state,
      arg,
      identities,
      ...rest
    });
  }
}

export const governance = new GovernanceModule(GOVERNANCE);
