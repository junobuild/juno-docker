import {assertNonNullish, fromNullable, toNullable, uint8ArrayToHexString} from '@dfinity/utils';
import {
  commitProposal,
  initProposal,
  submitProposal,
  uploadAssetWithProposal
} from '@junobuild/cdn';
import type {EncodingType} from '@junobuild/storage';
import {basename} from 'node:path';
import {CONSOLE_CANISTER_ID} from '../../modules/console';
import {buildConsoleParams} from '../../modules/satellite/console.config';
import type {CliContext} from '../../types/context';
import {loadWasm} from '../../utils/wasm.utils';

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
    cdn: {
      console: CONSOLE
    }
  });

  const filename = `${basename(wasmPath).replace('.wasm.gz', '').replace('.gz', '')}-v${version}.wasm.gz`;

  const fullPath = `/releases/${filename}`;

  const asset = {
    collection: '#releases',
    encoding: 'identity' as EncodingType,
    filename,
    fullPath,
    headers: [],
    data: new Blob([wasm]),
    description: `change=${proposalId};version=${version}`
  };

  await uploadAssetWithProposal({
    asset,
    proposalId,
    cdn: {
      console: CONSOLE
    }
  });

  const [__, {sha256, status}] = await submitProposal({
    proposalId,
    cdn: {
      console: CONSOLE
    }
  });

  const validation = fromNullable(sha256);

  assertNonNullish(validation);

  const verbose = (message?: unknown, ...optionalParams: unknown[]) => {
    if (process.env.CLI_BUILD !== 'console') {
      return;
    }

    console.log(message, optionalParams);
  };

  verbose('\nProposal submitted to Console.\n');
  verbose('🆔 ', proposalId);
  verbose('🔒 ', uint8ArrayToHexString(validation));
  verbose('⏳ ', status);

  await commitProposal({
    proposal: {
      proposal_id: proposalId,
      sha256: validation
    },
    cdn: {
      console: CONSOLE
    }
  });

  verbose(`🗳️  Proposal ${proposalId} committed.`);

  console.log(`💫  ${name} uploaded to Console.${process.env.CLI_BUILD === 'console' ? '\n' : ''}`);
};
