import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {nonNullish} from '@dfinity/utils';
import {createHash} from 'crypto';
import kleur from 'kleur';
import {readFile} from 'node:fs/promises';
import type {ModuleInitialDetail, ModuleParams, ModuleStatus} from '../types/module';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

export const status = ({
  key,
  config
}: ModuleParams & ModuleInitialDetail): ModuleStatus | undefined => config.getModule(key)?.status;

export const init = async ({
  identity,
  agent,
  config,
  key,
  name,
  canisterId: canisterIdParam
}: ModuleParams & ModuleInitialDetail) => {
  const {provisionalCreateCanisterWithCycles} = ICManagementCanister.create({
    agent
  });

  const canisterId = await provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [identity.getPrincipal().toString()]
    },
    ...(nonNullish(canisterIdParam) && {canisterId: Principal.from(canisterIdParam)})
  });

  config.saveModule({
    key,
    name,
    canisterId: canisterId.toString(),
    status: 'initialized'
  });
};

export const deploy = async ({
  identity,
  agent,
  config,
  key,
  name,
  arg,
  canisterId: canisterIdParam
}: ModuleParams & ModuleInitialDetail & {arg?: ArrayBuffer}) => {
  const mod = config.getModule(key);

  // We deploy only once
  if (nonNullish(mod)) {
    console.log(
      `🆗  ${green(name)} already exists. Skipping deployment. ID: ${cyan(mod.canisterId)}`
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

  config.saveModule({
    key,
    name,
    canisterId: canisterId.toString(),
    status: 'deployed'
  });

  console.log(`🚀  ${green(name)} deployed. ID: ${cyan(canisterId.toString())}`);
};
