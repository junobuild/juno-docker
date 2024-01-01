import type {JsonnableEd25519KeyIdentity} from '@dfinity/identity/lib/cjs/identity/ed25519';
import {nonNullish} from '@dfinity/utils';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {Segment} from '../types/segment';

interface CliConfigData {
  token?: JsonnableEd25519KeyIdentity;
  segments?: Segment[];
}

class CliConfigStore {
  private data: CliConfigData | undefined;

  constructor(private path: string) {
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
  private store: CliConfigStore;

  constructor(private path: string) {
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

  saveSegment(segment: Segment) {
    const segments = this.store.get<Segment[]>('segments') ?? [];
    this.store.set('segments', [...segments.filter(({key}) => key !== segment.key), segment]);
  }
  getSegment(key: string): Segment | undefined {
    return (this.store.get<Segment[]>('segments') ?? []).find(
      ({key: segmentKey}) => key === segmentKey
    );
  }
}