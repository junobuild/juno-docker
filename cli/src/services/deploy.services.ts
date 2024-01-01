import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {nonNullish} from '@dfinity/utils';
import {createHash} from 'crypto';
import kleur from 'kleur';
import {readFile} from 'node:fs/promises';
import {DeployModuleParams, ModuleInitialDetail} from '../types/module';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

export const deploy = async ({
  identity,
  agent,
  config,
  key,
  name,
  arg,
  canisterId: canisterIdParam
}: DeployModuleParams & ModuleInitialDetail & {arg?: ArrayBuffer}) => {
  const segment = config.getSegment(key);

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

  const {wasm} = await loadWasm(`./target/${key}.gz`);

  await installCode({
    mode: InstallMode.Install,
    canisterId,
    wasmModule: wasm,
    arg: new Uint8Array(arg ?? EMPTY_ARG)
  });

  config.saveSegment({
    key,
    name,
    canisterId: canisterId.toString()
  });

  console.log(`🚀  ${green(name)} deployed. ID: ${cyan(canisterId.toString())}`);
};
