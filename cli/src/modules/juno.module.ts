import {ICManagementCanister} from '@dfinity/ic-management';
import {Principal} from '@dfinity/principal';
import {isNullish} from '@dfinity/utils';
import type {ControllerScope} from '../declarations/console';
import type {getConsoleActor, getObservatoryActor} from '../services/actor.services';
import {Module} from '../services/modules.services';
import type {CliContext} from '../types/context';
import type {ModuleDescription} from '../types/module';

export type GetActorFn = typeof getObservatoryActor | typeof getConsoleActor;

export interface SetControllerParams {
  context: CliContext;
  scope: ControllerScope;
  controllerId: string;
}

export class JunoModule extends Module {
  readonly #getActorFn: GetActorFn;

  constructor({getActorFn, ...rest}: ModuleDescription & {getActorFn: GetActorFn}) {
    super(rest);

    this.#getActorFn = getActorFn;
  }

  async setController({context, controllerId, scope}: SetControllerParams) {
    const {agent} = context;

    const canisterId = this.canisterId(context);

    if (isNullish(canisterId)) {
      throw new Error(
        `Cannot set a controller for unknown module id. ${this.name} is not initialized!`
      );
    }

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
          controllers: [...controllers.map((p) => p.toText()), controllerId]
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

    // Add controller to the memory of the canister to allow guarded calls.
    const {set_controllers} = await this.#getActorFn({
      agent,
      canisterId
    });

    await set_controllers({
      controllers: [Principal.fromText(controllerId)],
      controller: {
        metadata: [],
        scope,
        expires_at: []
      }
    });
  }
}
