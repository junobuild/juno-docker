import {
  GovernanceCanister,
  NnsFunction,
  ProposalRewardStatus,
  ProposalStatus,
  Topic,
  type MakeProposalRequest
} from '@dfinity/nns';
import {createAgent} from '@dfinity/utils';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {ModuleInstallParams} from '../../types/module';
import {NEURON_ID} from "./governance.constants";
import {enumsExclude} from "./enum.utils";

export const makeIcpXdrProposal = async ({identities}: Pick<ModuleInstallParams, 'identities'>) => {
  const {[MAIN_IDENTITY_KEY]: identity} = identities;

  const agent = await createAgent({
    identity,
    host: 'http://127.0.0.1:5987',
    fetchRootKey: true
  });

  const {makeProposal, listProposals} = GovernanceCanister.create({
    agent
  });

  // Example found it some proposal
  const _payload = {
    data_source: '{"icp":["Binance"],"sdr":"xe.com"}',
    timestamp_seconds: 1683500400,
    xdr_permyriad_per_icp: 41388
  };

  // Source NNS dapp dummy-proposals.utils.js
  const exchangeRatePayload = new Uint8Array([
    68, 73, 68, 76, 1, 108, 3, 144, 203, 139, 170, 1, 113, 223, 245, 129, 160, 8, 120, 214, 213,
    218, 198, 15, 120, 1, 0, 3, 105, 109, 102, 16, 39, 0, 0, 0, 0, 0, 0, 229, 10, 27, 96, 0, 0, 0, 0
  ]);

  console.log('------------------------------------------------> BEGIN BEGIN BEGIN BEGIN BEGIN');

  const request: MakeProposalRequest = {
    neuronId: BigInt(NEURON_ID),
    url: 'https://forum.dfinity.org',
    title: 'ICP/XDR Conversion Rate',
    summary: `Set ICP/XDR conversion rate to ${10_000}`,
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: NnsFunction.IcpXdrConversionRate,
        payloadBytes: exchangeRatePayload
      }
    }
  };

  const result = await makeProposal(request);

  console.log('------------------------------------------------> END END END END END END END END', result);

  console.log(
    '---------__________>',
    await listProposals({
      request: {
        limit: 10000,
        beforeProposal: undefined,
        excludeTopic: [Topic.Unspecified],
        includeRewardStatus: enumsExclude({
          obj: ProposalRewardStatus as unknown as ProposalRewardStatus,
          values: [ProposalRewardStatus.Unknown]
        }),
        includeStatus: enumsExclude({
          obj: ProposalStatus as unknown as ProposalStatus,
          values: [ProposalStatus.Unknown]
        }),
        includeAllManageNeuronProposals: true
      },
      certified: false
    })
  );
};
