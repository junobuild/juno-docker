import {IDL} from '@dfinity/candid';
import {GovernanceCanister, NnsFunction, type MakeProposalRequest} from '@dfinity/nns';
import {createAgent} from '../../api/agent.api';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import {NEURON_ID} from '../../constants/modules.constants';
import type {ModuleInstallParams} from '../../types/module';

export const makeIcpXdrProposal = async ({
  identities,
  port
}: Pick<ModuleInstallParams, 'identities' | 'port'>) => {
  const {[MAIN_IDENTITY_KEY]: identity} = identities;

  const agent = await createAgent({
    identity,
    port
  });

  const {makeProposal} = GovernanceCanister.create({
    agent
  });

  const arg = IDL.encode(
    [
      IDL.Record({
        data_source: IDL.Text,
        timestamp_seconds: IDL.Nat64,
        xdr_permyriad_per_icp: IDL.Nat64,
        reason: IDL.Opt(
          IDL.Variant({
            OldRate: IDL.Null,
            DivergedRate: IDL.Null,
            EnableAutomaticExchangeRateUpdates: IDL.Null
          })
        )
      })
    ],
    [
      {
        data_source: '{"icp":["Binance"],"sdr":"xe.com"}', // Example of payload data found it some proposal
        timestamp_seconds: BigInt(Math.floor(Date.now() / 1000)), // Timestamp should not be < than 30 days from now
        xdr_permyriad_per_icp: BigInt(41388),
        reason: [{DivergedRate: null}]
      }
    ]
  );

  const request: MakeProposalRequest = {
    neuronId: NEURON_ID,
    url: 'https://forum.dfinity.org',
    title: 'ICP/XDR Conversion Rate',
    summary: `Set ICP/XDR conversion rate to 41388`,
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: NnsFunction.IcpXdrConversionRate,
        payloadBytes: arg
      }
    }
  };

  await makeProposal(request);
};
