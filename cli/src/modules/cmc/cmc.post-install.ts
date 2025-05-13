import {IC_ROOT_KEY, fromHex} from '@dfinity/agent';
import {IDL} from '@dfinity/candid';
import {GovernanceCanister, NnsFunction, type MakeProposalRequest} from '@dfinity/nns';
import {Principal} from '@dfinity/principal';
import {arrayBufferToUint8Array} from '@dfinity/utils';
import {createAgent} from '../../api/agent.api';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import {NEURON_ID} from '../../constants/modules.constants';
import type {ModuleInstallParams} from '../../types/module';

export const makeAuthorizedSubnetworksProposal = async ({
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

  const icRootKey = fromHex(IC_ROOT_KEY);

  const subnetId = Principal.selfAuthenticating(arrayBufferToUint8Array(icRootKey));

  const arg = IDL.encode(
    [
      IDL.Record({
        who: IDL.Opt(IDL.Principal),
        subnets: IDL.Vec(IDL.Principal)
      })
    ],
    [
      {
        who: [],
        subnets: [subnetId]
      }
    ]
  );

  const request: MakeProposalRequest = {
    neuronId: NEURON_ID,
    url: 'https://forum.dfinity.org',
    title: 'Authorize CMC to create canisters in subnets',
    summary: 'The lack of documentation makes developing anything with the CMC canister a pain.',
    action: {
      ExecuteNnsFunction: {
        nnsFunctionId: NnsFunction.SetAuthorizedSubnetworks,
        payloadBytes: arg
      }
    }
  };

  await makeProposal(request);
};
