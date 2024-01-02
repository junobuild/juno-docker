import type {JsonnableEd25519KeyIdentity} from '@dfinity/identity/lib/cjs/identity/ed25519';
import {nonNullish} from '@dfinity/utils';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';

import type {ModuleDetails} from '../types/module';

interface CliConfigData {
  token?: JsonnableEd25519KeyIdentity;
  segments?: ModuleDetails[];
}

class CliConfigStore {
  private data: CliConfigData | undefined;

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
    return this.data?.[key];
  }
}

export class CliConfig {
  private readonly store: CliConfigStore;

  constructor(readonly path: string) {
    this.store = new CliConfigStore(path);
  }

  // Token

  saveToken(token: JsonnableEd25519KeyIdentity) {
    this.store.set('token', token);
  }

  getToken(): JsonnableEd25519KeyIdentity | undefined {
    return this.store.get('token');
  }

  // Segment

  saveModule(mod: ModuleDetails) {
    const modules = this.store.get<ModuleDetails[]>('modules') ?? [];
    this.store.set('segments', [...modules.filter(({key}) => key !== mod.key), mod]);
  }

  getModule(key: string): ModuleDetails | undefined {
    return (this.store.get<ModuleDetails[]>('modules') ?? []).find(
      ({key: moduleKey}) => key === moduleKey
    );
  }
}
