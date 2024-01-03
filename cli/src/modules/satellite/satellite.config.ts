import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish} from '@dfinity/utils';
import {
  SatelliteParameters,
  listRules,
  listSatelliteControllers,
  setRule,
  setSatelliteControllers,
  type RulesType
} from '@junobuild/admin';
import type {Controller} from '@junobuild/admin/declarations/satellite/satellite.did';
import fetch from 'node-fetch';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';
import type {JunoDevConfig, SatelliteCollection, SatelliteController} from './satellite.types';

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

const buildSatelliteParams = ({
  canisterId,
  identity
}: SatelliteConfigContext): SatelliteParameters => ({
  satelliteId: canisterId,
  // TODO: TypeScript incompatibility window.fetch vs nodejs.fetch vs agent-ts using typeof fetch
  // @ts-expect-error
  fetch,
  identity,
  env: 'dev'
});

export type SatelliteConfigContext = CliContext & Pick<ModuleMetadata, 'canisterId'>;

export const configureCollections = async (context: SatelliteConfigContext) => {
  const {
    satellite: {
      collections: {db, storage}
    }
  } = await readConfig();

  const satellite = buildSatelliteParams(context);

  await Promise.all([
    configRules({type: 'db', collections: db, satellite}),
    configRules({type: 'storage', collections: storage, satellite})
  ]);
};

export const configureControllers = async (context: SatelliteConfigContext) => {
  const {
    satellite: {controllers}
  } = await readConfig();

  if ((controllers ?? []).length === 0) {
    return;
  }

  const satellite = buildSatelliteParams(context);

  type ControllerId = string;

  const existingControllers: Record<ControllerId, Controller> = (
    await listSatelliteControllers({satellite})
  ).reduce(
    (acc, [controller, details]) => ({
      ...acc,
      [controller.toText()]: details
    }),
    {}
  );

  const newControllers = (controllers ?? []).filter(({id}) => isNullish(existingControllers[id]));

  // If no new controllers need to be applied, we can return.
  if (newControllers.length === 0) {
    return;
  }

  const [write, admin] = newControllers.reduce(
    ([write, admin]: [SatelliteController[], SatelliteController[]], controller) => [
      [...write, ...(controller.scope === 'write' ? [controller] : [])],
      [...admin, ...(controller.scope === 'admin' ? [controller] : [])]
    ],
    [[], []]
  );

  const {agent, canisterId} = context;

  // We do not have mission control in this context, therefore we need to set the admin controllers ourselves.
  if (admin.length > 0) {
    const {updateSettings} = ICManagementCanister.create({
      agent
    });

    await updateSettings({
      canisterId: Principal.from(canisterId),
      settings: {
        controllers: [...Object.keys(existingControllers), ...admin.map(({id}) => id)]
      }
    });
  }

  const setControllers = async ({
    controllerScope,
    controllers
  }: {
    controllerScope: 'Write' | 'Admin';
    controllers: SatelliteController[];
  }) => {
    await setSatelliteControllers({
      args: {
        controller: {
          metadata: [],
          scope: controllerScope === 'Write' ? {Write: null} : {Admin: null},
          expires_at: []
        },
        controllers: controllers.map(({id}) => Principal.from(id))
      },
      satellite
    });
  };

  // Finally we can set the controllers within the satellite heap memory
  await Promise.all([
    ...[write.length > 0 ? [setControllers({controllerScope: 'Write', controllers: write})] : []],
    ...[admin.length > 0 ? [setControllers({controllerScope: 'Admin', controllers: admin})] : []]
  ]);
};
