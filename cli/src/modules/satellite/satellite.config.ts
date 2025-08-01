import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish} from '@dfinity/utils';
import type {PrincipalText} from '@dfinity/zod-schemas';
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
  SatelliteDevDataStoreCollection,
  SatelliteDevStorageCollection
} from '@junobuild/config';
import {readJunoDevConfig} from '../../configs/juno.dev.config';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {ControllerScope} from '../../declarations/satellite';
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

  if (isNullish(controllers) || controllers.length === 0) {
    return;
  }

  await setControllers({
    context,
    controllers: controllers.map(({scope, ...rest}) => ({
      ...rest,
      scope: scope === 'submit' ? {Submit: null} : scope === 'write' ? {Write: null} : {Admin: null}
    }))
  });
};

export interface SatelliteDevController {
  id: PrincipalText;
  scope: ControllerScope;
}

export const setControllers = async ({
  context,
  controllers
}: {
  context: SatelliteConfigContext;
  controllers: SatelliteDevController[];
}) => {
  const satellite = buildSatelliteParams(context);

  type ControllerId = string;

  const existingControllers = (await listSatelliteControllers({satellite})).reduce<
    Record<ControllerId, Controller>
  >(
    (acc, [controller, details]) => ({
      ...acc,
      [controller.toText()]: details
    }),
    {}
  );

  const newControllers = controllers.filter(({id}) => isNullish(existingControllers[id]));

  // If no new controllers need to be applied, we can return.
  if (newControllers.length === 0) {
    console.log(`ℹ️  The access key are already configured.`);
    return;
  }

  const [write, admin, submit] = newControllers.reduce<
    [SatelliteDevController[], SatelliteDevController[], SatelliteDevController[]]
  >(
    ([write, admin, submit], controller) => [
      [...write, ...('Write' in controller.scope ? [controller] : [])],
      [...admin, ...('Admin' in controller.scope ? [controller] : [])],
      [...submit, ...('Submit' in controller.scope ? [controller] : [])]
    ],
    [[], [], []]
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
    controllerScope: 'Write' | 'Admin' | 'Submit';
    controllers: SatelliteDevController[];
  }) => {
    await setSatelliteControllers({
      args: {
        controller: {
          metadata: [],
          scope:
            controllerScope === 'Submit'
              ? {Submit: null}
              : controllerScope === 'Write'
                ? {Write: null}
                : {Admin: null},
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
    ...[admin.length > 0 ? [setControllers({controllerScope: 'Admin', controllers: admin})] : []],
    ...[submit.length > 0 ? [setControllers({controllerScope: 'Submit', controllers: submit})] : []]
  ]);
};
