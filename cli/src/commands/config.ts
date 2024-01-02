import {modules} from '../modules/modules';
import {buildContent} from '../services/context.services';

export const config = async (args?: string[]) => {
  const context = await buildContent(args);

  await Promise.all(
    modules.map(async (mod) => {
      await mod.configure(context);
    })
  );
};
