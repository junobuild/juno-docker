import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {type ControllerScope} from '../declarations/observatory';
import {CONSOLE_CANISTER_ID} from '../modules/console';
import {observatory, OBSERVATORY_CANISTER_ID} from '../modules/observatory';
import type {CliContext} from '../types/context';
import {type ModuleKey} from '../types/module';
import {getConsoleActor, getObservatoryActor} from './actor.services';

export const setController = async ({
  context,
  searchParams,
  key
}: {
  context: CliContext;
  searchParams: URLSearchParams;
  key: ModuleKey;
}) => {
  const {agent} = context;

  const id = searchParams.get('id') ?? '';
  const scope: ControllerScope =
    searchParams.get('scope') === 'write' ? {Write: null} : {Admin: null};

  const canisterId = key === observatory.key ? OBSERVATORY_CANISTER_ID : CONSOLE_CANISTER_ID;

  const updateControllers = async () => {
    // Set the controller to the canister.
    const {updateSettings, canisterStatus} = ICManagementCanister.create({
      agent
    });

    const {
      settings: {controllers}
    } = await canisterStatus(Principal.from(canisterId));

    await updateSettings({
      canisterId: Principal.from(canisterId),
      settings: {
        controllers: [...controllers.map((p) => p.toText()), id]
      }
    });
  };

  const controllersFn =
    'Write' in scope
      ? async (): Promise<void> => {
          await Promise.resolve();
        }
      : updateControllers;
  await controllersFn();

  const getActorFn = key === observatory.key ? getObservatoryActor : getConsoleActor;

  // Add controller to the memory of the canister to allow guarded calls.
  const {set_controllers} = await getActorFn({
    agent,
    canisterId
  });

  await set_controllers({
    controllers: [Principal.fromText(id)],
    controller: {
      metadata: [],
      scope,
      expires_at: []
    }
  });
};
