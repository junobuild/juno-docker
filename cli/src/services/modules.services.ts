import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish, nonNullish} from '@dfinity/utils';
import {createHash} from 'crypto';
import kleur from 'kleur';
import {readFile} from 'node:fs/promises';
import {
  ModuleCanisterId,
  ModuleDescription,
  ModuleMetadata,
  ModuleParams,
  ModuleStatus
} from '../types/module';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

const status = ({key, config}: ModuleParams & ModuleDescription): ModuleStatus | undefined =>
  config.getModule(key)?.status;

const canisterId = ({
  key,
  config
}: ModuleParams & Pick<ModuleMetadata, 'key'>): ModuleCanisterId | undefined =>
  config.getModule(key)?.canisterId;

const createCanister = async ({
  identity,
  agent,
  canisterId: canisterIdParam
}: ModuleParams & Pick<ModuleDescription, 'canisterId'>): Promise<Principal> => {
  const {provisionalCreateCanisterWithCycles} = ICManagementCanister.create({
    agent
  });

  return provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [identity.getPrincipal().toString()]
    },
    ...(nonNullish(canisterIdParam) && {canisterId: Principal.from(canisterIdParam)})
  });
};

const installCode = async ({
  agent,
  arg,
  canisterId,
  key
}: ModuleParams & Omit<ModuleMetadata, 'status'> & {arg?: ArrayBuffer}) => {
  const {installCode} = ICManagementCanister.create({
    agent
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
    canisterId: Principal.from(canisterId),
    wasmModule: wasm,
    arg: new Uint8Array(arg ?? EMPTY_ARG)
  });
};

export class Module {
  constructor(private readonly description: ModuleDescription) {}

  get key(): string {
    return this.description.key;
  }

  get name(): string {
    return this.description.name;
  }

  status(params: ModuleParams): ModuleStatus | undefined {
    return status({...params, ...this.description});
  }

  canisterId(params: ModuleParams): string | undefined {
    return canisterId({...params, ...this.description});
  }

  async init(params: ModuleParams): Promise<void> {
    const canisterId = await createCanister({...params, ...this.description});

    const {config, ...rest} = params;

    config.saveModule({
      key: this.key,
      name: this.name,
      canisterId: canisterId.toString(),
      status: 'initialized'
    });
  }

  async deploy(params: ModuleParams & {arg?: ArrayBuffer}): Promise<void> {
    const {config, ...rest} = params;

    const metadata = config.getModule(this.key);

    if (isNullish(metadata)) {
      throw new Error('Module has not been initialized and therefore cannot be deployed!');
    }

    await installCode({...params, ...metadata});

    config.saveModule({
      ...metadata,
      status: 'deployed'
    });

    const {name, canisterId} = metadata;

    console.log(`🚀  ${green(name)} deployed. ID: ${cyan(canisterId.toString())}`);
  }
}
