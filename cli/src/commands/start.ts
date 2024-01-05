import {modules} from '../modules/modules';
import {buildContext} from '../services/context.services';

export const start = async (args?: string[]) => {
  const context = await buildContext(args);

  await Promise.all(
    modules.map(async (mod) => {
      await mod.start(context);
    })
  );
};
