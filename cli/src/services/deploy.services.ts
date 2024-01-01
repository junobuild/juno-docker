import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {nonNullish} from '@dfinity/utils';
import {createHash} from 'crypto';
import kleur from 'kleur';
import {readFile} from 'node:fs/promises';
import {getSegment, saveSegment} from '../configs/cli.config';
import {DeployParams, SegmentDescription} from '../types/plugin';

const {green, cyan} = kleur;

export const deploy = async ({
  identity,
  agent,
  key,
  name,
  canisterId: canisterIdParam
}: DeployParams & SegmentDescription) => {
  const segment = getSegment(key);

  // We deploy only once
  if (nonNullish(segment)) {
    console.log(
      `🆗  ${green(name)} already exists. Skipping deployment. ID: ${cyan(segment.canisterId)}`
    );
    return;
  }

  const {provisionalCreateCanisterWithCycles, installCode} = ICManagementCanister.create({
    agent
  });

  const canisterId = await provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [identity.getPrincipal().toString()]
    },
    ...(nonNullish(canisterIdParam) && {canisterId: Principal.from(canisterIdParam)})
  });

  const loadWasm = async (file: string): Promise<{hash: string; wasm: Buffer}> => {
    const wasm = await readFile(file);

    return {
      wasm,
      hash: createHash('sha256').update(wasm).digest('hex')
    };
  };

  const arg = IDL.encode([], []);

  const {wasm} = await loadWasm(`./target/${key}.gz`);

  await installCode({
    mode: InstallMode.Install,
    canisterId,
    wasmModule: wasm,
    arg: new Uint8Array(arg)
  });

  saveSegment({
    key,
    name,
    canisterId: canisterId.toString()
  });

  console.log(`🚀  ${green(name)} deployed. ID: ${cyan(canisterId.toString())}`);
};
