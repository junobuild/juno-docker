import {IDL} from '@dfinity/candid';
import {ICManagementCanister, InstallMode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish, nonNullish} from '@dfinity/utils';
import {readFileSync} from 'atomically';
import {createHash} from 'crypto';
import kleur from 'kleur';
import type {CliContext} from '../types/context';
import {
  ModuleCanisterId,
  ModuleDescription,
  ModuleInstallParams,
  ModuleMetadata,
  ModuleStatus
} from '../types/module';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

interface Wasm {
  hash: string;
  wasm: Buffer;
}

const status = ({key, state}: CliContext & ModuleDescription): ModuleStatus | undefined =>
  state.getModule(key)?.status;

const hash = ({key, state}: CliContext & ModuleDescription): string | undefined =>
  state.getModule(key)?.hash;

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

const loadWasm = ({
  key,
  wasmPath
}: Pick<ModuleMetadata, 'key'> & Pick<ModuleDescription, 'wasmPath'>): Wasm => {
  const file = wasmPath ?? `./target/${key}.gz`;

  const wasm = readFileSync(file);

  return {
    wasm,
    hash: createHash('sha256').update(wasm).digest('hex')
  };
};

const installCode = async ({
  agent,
  arg,
  canisterId,
  wasm: wasmModule,
  mode
}: CliContext &
  Omit<ModuleMetadata, 'status'> & {arg?: ArrayBuffer; wasm: Buffer; mode: InstallMode}) => {
  const {installCode} = ICManagementCanister.create({
    agent
  });

  await installCode({
    mode,
    canisterId: Principal.from(canisterId),
    wasmModule,
    arg: new Uint8Array(arg ?? EMPTY_ARG)
  });
};

export class Module {
  private readonly data: ModuleDescription & Wasm;

  constructor({key, wasmPath, ...rest}: ModuleDescription) {
    this.data = {
      key,
      ...rest,
      ...loadWasm({key, wasmPath})
    };
  }

  get key(): string {
    return this.data.key;
  }

  get name(): string {
    return this.data.name;
  }

  get hash(): string {
    return this.data.hash;
  }

  get wasm(): Buffer {
    return this.data.wasm;
  }

  status(context: CliContext): ModuleStatus | undefined {
    return status({...context, ...this.data});
  }

  isDeployed(context: CliContext): boolean {
    return this.hash === hash({...context, ...this.data}) && this.status(context) === 'deployed';
  }

  canisterId(context: CliContext): string | undefined {
    return canisterId({...context, ...this.data});
  }

  async prepare(context: CliContext): Promise<void> {
    const canisterId = await createCanister({...context, ...this.data});

    const {state} = context;

    state.saveModule({
      key: this.key,
      name: this.name,
      canisterId: canisterId.toString(),
      status: 'initialized',
      hash: this.hash
    });
  }

  async install({installMode: mode, ...context}: ModuleInstallParams): Promise<void> {
    const {state} = context;

    const metadata = state.getModule(this.key);

    if (isNullish(metadata)) {
      throw new Error('Module has not been initialized and therefore cannot be deployed!');
    }

    await installCode({...context, ...metadata, wasm: this.wasm, mode});

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
