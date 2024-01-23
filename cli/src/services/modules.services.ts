import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish, nonNullish} from '@dfinity/utils';
import {createHash} from 'crypto';
import kleur from 'kleur';
import {readFile} from 'node:fs/promises';
import type {CliContext} from '../types/context';
import type {
  ModuleCanisterId,
  ModuleDescription,
  ModuleMetadata,
  ModuleStatus
} from '../types/module';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

const status = ({key, state}: CliContext & ModuleDescription): ModuleStatus | undefined =>
  state.getModule(key)?.status;

const canisterId = ({
  key,
  state
}: CliContext & Pick<ModuleMetadata, 'key'>): ModuleCanisterId | undefined =>
  state.getModule(key)?.canisterId;

const createCanister = async ({
  identity,
  agent,
  canisterId: canisterIdParam
}: CliContext & Pick<ModuleDescription, 'canisterId'>): Promise<Principal> => {
  const {provisionalCreateCanisterWithCycles} = ICManagementCanister.create({
    agent
  });

  return await provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [identity.getPrincipal().toString()]
    },
    ...(nonNullish(canisterIdParam) && {canisterId: Principal.from(canisterIdParam)})
  });
};

const loadWasm = async ({key}: Pick<ModuleMetadata, "key">): Promise<{hash: string; wasm: Buffer}> => {
  const file = `./target/${key}.gz`;

  const wasm = await readFile(file);

  return {
    wasm,
    hash: createHash('sha256').update(wasm).digest('hex')
  };
};

const installCode = async ({
  agent,
  arg,
  canisterId,
  key
}: CliContext & Omit<ModuleMetadata, 'status'> & {arg?: ArrayBuffer}) => {
  const {installCode} = ICManagementCanister.create({
    agent
  });

  const {wasm} = await loadWasm({key});

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

  status(context: CliContext): ModuleStatus | undefined {
    return status({...context, ...this.description});
  }

  canisterId(context: CliContext): string | undefined {
    return canisterId({...context, ...this.description});
  }

  async prepare(context: CliContext): Promise<void> {
    const canisterId = await createCanister({...context, ...this.description});

    const {hash} = await loadWasm({key: this.key});

    const {state} = context;

    state.saveModule({
      key: this.key,
      name: this.name,
      canisterId: canisterId.toString(),
      status: 'initialized',
      hash
    });
  }

  async install(context: CliContext & {arg?: ArrayBuffer}): Promise<void> {
    const {state} = context;

    const metadata = state.getModule(this.key);

    if (isNullish(metadata)) {
      throw new Error('Module has not been initialized and therefore cannot be deployed!');
    }

    await installCode({...context, ...metadata});

    state.saveModule({
      ...metadata,
      status: 'deployed'
    });

    const {name, canisterId} = metadata;

    console.log(`🚀  ${green(name)} deployed. ID: ${cyan(canisterId.toString())}`);
  }

  async start(_context: CliContext) {
    // Default is do nothing on start
  }
}
