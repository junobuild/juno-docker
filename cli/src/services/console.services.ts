import {Principal} from '@dfinity/principal';
import {assertNonNullish, fromNullable, toNullable, uint8ArrayToHexString} from '@dfinity/utils';
import {commitProposal, initProposal, submitProposal, uploadAsset} from '@junobuild/console';
import type {ENCODING_TYPE} from '@junobuild/storage';
import {basename} from 'node:path';
import {CONSOLE_CANISTER_ID} from '../modules/console';
import {buildConsoleParams} from '../modules/satellite/console.config';
import type {CliContext} from '../types/context';
import {loadWasm} from '../utils/wasm.utils';
import {getConsoleActor} from './actor.services';

export const setController = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const {agent} = context;
  const {set_controllers} = await getConsoleActor({
    agent,
    canisterId: CONSOLE_CANISTER_ID
  });

  const id = searchParams.get('id') ?? '';

  await set_controllers({
    controllers: [Principal.fromText(id)],
    controller: {
      metadata: [],
      scope: {Admin: null},
      expires_at: []
    }
  });
};

export const installRelease = async ({
  context,
  key,
  name,
  version,
  wasmPath
}: {
  context: CliContext;
  key: string;
  name: string;
  version: string;
  wasmPath: string;
}) => {
  const {wasm} = loadWasm({wasmPath});

  const proposalType = {
    SegmentsDeployment: {
      orbiter: toNullable(key === 'orbiter' ? version : undefined),
      mission_control_version: toNullable(key === 'mission_control' ? version : undefined),
      satellite_version: toNullable(key === 'satellite' ? version : undefined)
    }
  };

  const CONSOLE = buildConsoleParams({...context, canisterId: CONSOLE_CANISTER_ID});

  const [proposalId, _] = await initProposal({
    proposalType,
    console: CONSOLE
  });

  const filename = `${basename(wasmPath).replace('.wasm.gz', '')}-v${version}.wasm.gz`;

  const fullPath = `/releases/${filename}`;

  const asset = {
    collection: '#releases',
    encoding: 'identity' as ENCODING_TYPE,
    filename,
    fullPath,
    headers: [],
    data: new Blob([wasm])
  };

  await uploadAsset({
    asset,
    proposalId,
    console: CONSOLE
  });

  const [__, {sha256, status}] = await submitProposal({
    proposalId,
    console: CONSOLE
  });

  const validation = fromNullable(sha256);

  assertNonNullish(validation);

  console.log('\nProposal submitted to Console.\n');
  console.log('🆔 ', proposalId);
  console.log('🔒 ', uint8ArrayToHexString(validation));
  console.log('⏳ ', status);

  await commitProposal({
    commitProposal: {
      proposal_id: proposalId,
      sha256: validation
    },
    console: CONSOLE
  });

  console.log(`🗳️  Proposal ${proposalId} committed.`);

  console.log(`💫  ${name} uploaded to Console.\n`);
};
