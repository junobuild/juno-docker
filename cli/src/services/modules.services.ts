import {IDL} from '@dfinity/candid';
import {ICManagementCanister, type canister_install_mode} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish, nonNullish} from '@dfinity/utils';
import {upgradeModule} from '@junobuild/admin';
import kleur from 'kleur';
import {MAIN_IDENTITY_KEY} from '../constants/constants';
import {INSTALL_MODE_INSTALL, INSTALL_MODE_UPGRADE} from '../constants/upgrade.constants';
import type {CliContext} from '../types/context';
import type {
  ModuleCanisterId,
  ModuleDescription,
  ModuleInstallParams,
  ModuleMetadata,
  ModuleStatus
} from '../types/module';
import {loadWasm, type Wasm} from '../utils/wasm.utils';

const {green, cyan} = kleur;

const EMPTY_ARG = IDL.encode([], []);

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
  identities: {[MAIN_IDENTITY_KEY]: mainIdentity},
  agent,
  canisterId: canisterIdParam
}: CliContext & Pick<ModuleDescription, 'canisterId'>): Promise<Principal> => {
  const {provisionalCreateCanisterWithCycles} = ICManagementCanister.create({
    agent
  });

  return await provisionalCreateCanisterWithCycles({
    settings: {
      controllers: [mainIdentity.getPrincipal().toString()]
    },
    ...(nonNullish(canisterIdParam) && {canisterId: Principal.from(canisterIdParam)})
  });
};

const installCode = async ({
  agent,
  arg,
  canisterId,
  wasm: wasmModule,
  mode,
  identities: {[MAIN_IDENTITY_KEY]: mainIdentity}
}: CliContext &
  Omit<ModuleMetadata, 'status'> & {
    arg?: ArrayBuffer;
    wasm: Buffer;
    mode: canister_install_mode;
  }) => {
  await upgradeModule({
    actor: {
      agent,
      identity: mainIdentity
    },
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
      ...loadWasm({wasmPath: wasmPath ?? `./target/${key}.gz`})
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

  async install(context: ModuleInstallParams): Promise<void> {
    const {state} = context;

    const metadata = state.getModule(this.key);

    if (isNullish(metadata)) {
      throw new Error('Module has not been initialized and therefore cannot be deployed!');
    }

    const mode = this.status(context) === 'deployed' ? INSTALL_MODE_UPGRADE : INSTALL_MODE_INSTALL;

    await installCode({...context, ...metadata, wasm: this.wasm, mode});

    state.saveModule({
      ...metadata,
      hash: this.hash,
      status: 'deployed'
    });

    const {name, canisterId} = metadata;

    console.log(
      `🚀  ${green(name)} ${'upgrade' in mode ? 'upgraded' : 'deployed'}. ID: ${cyan(
        canisterId.toString()
      )}`
    );
  }

  async postInstall(_context: ModuleInstallParams) {
    // Default is do nothing after install
  }

  async start(_context: CliContext) {
    // Default is do nothing on start
  }
}
