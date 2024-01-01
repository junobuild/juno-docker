import type {JsonnableEd25519KeyIdentity} from '@dfinity/identity/lib/cjs/identity/ed25519';
// TODO: fix TypeScript declaration import of conf
// @ts-expect-error
import Conf, {type Schema} from 'conf';
import {CLI_PROJECT_NAME} from '../constants/constants';
import {Segment} from '../types/segment';

interface CliConfig {
  token: JsonnableEd25519KeyIdentity;
  segments: Segment[];
}

const schema: Schema<CliConfig> = {
  token: {
    type: 'array'
  },
  segments: {
    type: 'array'
  }
} as const;

// Save in https://github.com/sindresorhus/env-paths#pathsconfig
const config = new Conf<CliConfig>({projectName: CLI_PROJECT_NAME, schema});

// Token

export const saveToken = (token: JsonnableEd25519KeyIdentity) => config.set('token', token);
export const getToken = (): JsonnableEd25519KeyIdentity | undefined => config.get('token');

// Segment

export const saveSegment = (segment: Segment) => {
  const segments = config.get('segments') ?? [];
  config.set('segments', [...segments.filter(({key}) => key !== segment.key), segment]);
};
export const getSegment = (key: string): Segment | undefined =>
  (config.get('segments') ?? []).find(({key: segmentKey}) => key === segmentKey);
