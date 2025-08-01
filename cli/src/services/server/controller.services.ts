import type {ControllerScope} from '../../declarations/console';
import {consoleModule} from '../../modules/console';
import {observatory} from '../../modules/observatory';
import type {CliContext} from '../../types/context';
import type {ModuleKey} from '../../types/module';

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
    case consoleModule.key:
      await consoleModule.setController({context, controllerId, scope});
      break;
    case observatory.key:
      await observatory.setController({context, controllerId, scope});
      break;
  }
};
