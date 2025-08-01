import type {ControllerScope} from '../declarations/console';
import {CONSOLE_CANISTER_ID, consoleModule} from '../modules/console';
import {observatory, OBSERVATORY_CANISTER_ID} from '../modules/observatory';
import type {CliContext} from '../types/context';
import type {ModuleKey} from '../types/module';

export const setController = async ({
  context,
  searchParams,
  key
}: {
  context: CliContext;
  searchParams: URLSearchParams;
  key: ModuleKey;
}) => {
  const controllerId = searchParams.get('id') ?? '';
  const scope: ControllerScope =
    searchParams.get('scope') === 'write' ? {Write: null} : {Admin: null};

  switch (key) {
    case CONSOLE_CANISTER_ID:
      await consoleModule.setController({context, controllerId, scope});
      break;
    case OBSERVATORY_CANISTER_ID:
      await observatory.setController({context, controllerId, scope});
      break;
  }
};
