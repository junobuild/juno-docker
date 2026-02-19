import {isNullish} from '@dfinity/utils';
import type {PrincipalText} from '@dfinity/zod-schemas';
import {IcManagementCanister} from '@icp-sdk/canisters/ic-management';
import {Principal} from '@icp-sdk/core/principal';
import {
  listSatelliteControllers,
  setSatelliteControllers as setSatelliteControllersAdmin
} from '@junobuild/admin';
import type {SatelliteDid, SatelliteParameters} from '@junobuild/ic-client/actor';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {ControllerScope} from '../../declarations/satellite';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';

const buildSatelliteParams = ({
  canisterId,
  identities: {[MAIN_IDENTITY_KEY]: identity}
}: SatelliteConfigContext): SatelliteParameters => ({
  satelliteId: canisterId,
  identity,
  container: true
});

export type SatelliteConfigContext = CliContext & Pick<ModuleMetadata, 'canisterId'>;

export interface SatelliteDevController {
  id: PrincipalText;
  scope: ControllerScope;
}

export const setSatelliteControllers = async ({
  context,
  controllers,
  profile
}: {
  context: SatelliteConfigContext;
  controllers: SatelliteDevController[];
  profile?: string;
}) => {
  const satellite = buildSatelliteParams(context);

  type ControllerId = string;

  const existingControllers = (await listSatelliteControllers({satellite})).reduce<
    Record<ControllerId, SatelliteDid.Controller>
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

  // We do not have mission control in the satellite image, therefore we set the admin controllers ourselves.
  if (admin.length > 0) {
    const {updateSettings} = IcManagementCanister.create({
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
    await setSatelliteControllersAdmin({
      args: {
        controller: {
          metadata: [['profile', profile ?? '👾 Emulator']],
          scope:
            controllerScope === 'Submit'
              ? {Submit: null}
              : controllerScope === 'Write'
                ? {Write: null}
                : {Admin: null},
          expires_at: [],
          kind: []
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
