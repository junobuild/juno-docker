import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish} from '@dfinity/utils';
import {
  listRules,
  listSatelliteControllers,
  setRule,
  setSatelliteControllers,
  type SatelliteParameters
} from '@junobuild/admin';
import type {Controller} from '@junobuild/admin/dist/declarations/satellite/satellite.did';
import type {ListRulesResults} from '@junobuild/admin/dist/types/types/list.types';
import type {
  RulesType,
  SatelliteDevController,
  SatelliteDevDataStoreCollection,
  SatelliteDevStorageCollection
} from '@junobuild/config';
import {readJunoDevConfig} from '../../configs/juno.dev.config';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';

const list = async ({type, satellite}): Promise<ListRulesResults> =>
  await listRules({
    type,
    satellite
  });

const configRules = async ({
  type,
  collections,
  satellite
}: {
  type: RulesType;
  collections: Array<SatelliteDevDataStoreCollection | SatelliteDevStorageCollection>;
  satellite: SatelliteParameters;
}) => {
  const {items: existingRules} = await list({type, satellite});

  await Promise.all(
    collections.map(async ({collection, memory, ...rest}) => {
      await setRule({
        type,
        satellite,
        rule: {
          ...(existingRules.find(
            ({collection: existingCollection}) => existingCollection === collection
          ) ?? {}),
          collection,
          memory: memory.toLowerCase() === 'stable' ? 'stable' : 'heap',
          ...rest
        }
      });
    })
  );
};

const buildSatelliteParams = ({
  canisterId,
  identities: {[MAIN_IDENTITY_KEY]: identity}
}: SatelliteConfigContext): SatelliteParameters => ({
  satelliteId: canisterId,
  identity,
  container: true
});

export type SatelliteConfigContext = CliContext & Pick<ModuleMetadata, 'canisterId'>;

export const configureCollections = async (context: SatelliteConfigContext) => {
  const {
    satellite: {
      collections: {datastore, storage}
    }
  } = await readJunoDevConfig();

  const satellite = buildSatelliteParams(context);

  await Promise.all([
    configRules({type: 'db', collections: datastore ?? [], satellite}),
    configRules({type: 'storage', collections: storage ?? [], satellite})
  ]);
};

export const configureControllers = async (context: SatelliteConfigContext) => {
  const {
    satellite: {controllers}
  } = await readJunoDevConfig();

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
    ([write, admin]: [SatelliteDevController[], SatelliteDevController[]], controller) => [
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
    controllers: SatelliteDevController[];
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
