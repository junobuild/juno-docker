import {modules, troublemakers} from '../modules/modules';
import {buildContext} from '../services/context.services';

export const start = async (args?: string[]) => {
  const context = await buildContext(args);

  await Promise.all(
    [...modules, ...troublemakers].map(async (mod) => {
      await mod.start(context);
    })
  );
};
