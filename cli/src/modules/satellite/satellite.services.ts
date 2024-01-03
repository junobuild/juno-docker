import type {SatelliteParameters} from '@junobuild/admin';
import {listRules, setRule, type RulesType} from '@junobuild/admin';
import fetch from 'node-fetch';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';
import type {JunoDevConfig, SatelliteCollection} from './satellite.types';

const readConfig = async (): Promise<JunoDevConfig> => {
  const buffer = await readFile(join(process.cwd(), 'juno.dev.json'));
  return JSON.parse(buffer.toString('utf-8'));
};

const list = async ({type, satellite}) =>
  listRules({
    type,
    satellite
  });

const configRules = async ({
  type,
  collections,
  satellite
}: {
  type: RulesType;
  collections: SatelliteCollection[];
  satellite: SatelliteParameters;
}) => {
  const existingRules = await list({type, satellite});

  await Promise.all(
    collections.map(({collection, memory, ...rest}) =>
      setRule({
        type,
        satellite,
        rule: {
          ...(existingRules.find(
            ({collection: existingCollection}) => existingCollection === collection
          ) ?? {}),
          collection,
          memory: memory.toLowerCase() === 'stable' ? 'Stable' : 'Heap',
          ...rest
        }
      })
    )
  );
};

export const configureCollections = async ({
  identity,
  canisterId
}: CliContext & Pick<ModuleMetadata, 'canisterId'>) => {
  const {
    satellite: {
      collections: {db, storage}
    }
  } = await readConfig();

  const satellite: SatelliteParameters = {
    satelliteId: canisterId,
    // TODO: TypeScript incompatibility window.fetch vs nodejs.fetch vs agent-ts using typeof fetch
    // @ts-expect-error
    fetch,
    identity,
    env: 'dev'
  };

  await Promise.all([
    configRules({type: 'db', collections: db, satellite}),
    configRules({type: 'storage', collections: storage, satellite})
  ]);
};
