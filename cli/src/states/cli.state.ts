import type {JsonnableEd25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import {readFileSync, writeFileSync} from 'atomically';
import {existsSync} from 'node:fs';
import type {ModuleMetadata} from '../types/module';

interface CliStoreData {
  token?: JsonnableEd25519KeyIdentity;
  modules?: ModuleMetadata[];
}

class CliStore {
  private data: CliStoreData | undefined;

  constructor(private readonly path: string) {
    if (!existsSync(path)) {
      return;
    }

    this.data = JSON.parse(readFileSync(path, {encoding: 'utf-8'}));
  }

  set<T>(key: string, value: T) {
    this.data = {
      ...(nonNullish(this.data) && this.data),
      [key]: value
    };

    writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  get<T>(key: string): T | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.data?.[key];
  }
}

export class CliState {
  private readonly store: CliStore;

  constructor(readonly path: string) {
    this.store = new CliStore(path);
  }

  // Identities

  saveIdentity({key, jsonIdentity}: {key: string; jsonIdentity: JsonnableEd25519KeyIdentity}) {
    const identities =
      this.store.get<Array<[string, JsonnableEd25519KeyIdentity]>>('identities') ?? [];
    this.store.set('identities', [
      ...identities.filter(([moduleKey, _]) => moduleKey !== key),
      [key, jsonIdentity]
    ]);
  }

  getIdentity(key: string): [string, JsonnableEd25519KeyIdentity] | undefined {
    return (this.store.get<Array<[string, JsonnableEd25519KeyIdentity]>>('identities') ?? []).find(
      ([moduleKey, _]) => key === moduleKey
    );
  }

  // Modules

  saveModule(mod: ModuleMetadata) {
    const modules = this.store.get<ModuleMetadata[]>('modules') ?? [];
    this.store.set('modules', [...modules.filter(({key}) => key !== mod.key), mod]);
  }

  getModule(key: string): ModuleMetadata | undefined {
    return (this.store.get<ModuleMetadata[]>('modules') ?? []).find(
      ({key: moduleKey}) => key === moduleKey
    );
  }
}
