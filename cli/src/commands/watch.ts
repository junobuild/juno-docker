import {watchDevConfig} from '../watch/config.watch';
import {watchDeploy} from '../watch/deploy.watch';

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), watchDevConfig(args)]);
};
