import {IDL} from '@dfinity/candid';
import {GovernanceCanister, NnsFunction, type MakeProposalRequest} from '@dfinity/nns';
import {createAgent} from '@dfinity/utils';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {ModuleInstallParams} from '../../types/module';
import {NEURON_ID} from './governance.constants';

export const makeIcpXdrProposal = async ({identities}: Pick<ModuleInstallParams, 'identities'>) => {
  const {[MAIN_IDENTITY_KEY]: identity} = identities;

  const agent = await createAgent({
    identity,
    host: 'http://127.0.0.1:5987',
    fetchRootKey: true
  });

  const {makeProposal} = GovernanceCanister.create({
    agent
  });

  // Example of payload data found it some proposal
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
        data_source: '{"icp":["Binance"],"sdr":"xe.com"}',
        timestamp_seconds: BigInt(1683500400),
        xdr_permyriad_per_icp: BigInt(41388),
        reason: [{DivergedRate: null}]
      }
    ]
  );

  const request: MakeProposalRequest = {
    neuronId: BigInt(NEURON_ID),
    url: 'https://forum.dfinity.org',
    title: 'ICP/XDR Conversion Rate',
    summary: `Set ICP/XDR conversion rate to ${10_000}`,
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: NnsFunction.IcpXdrConversionRate,
        payloadBytes: arg
      }
    }
  };

  await makeProposal(request);
};
