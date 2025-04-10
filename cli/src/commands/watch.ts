import {watchDevConfig} from '../watch/deploy/config.watch';
import {watchDeploy} from '../watch/deploy/deploy.watch';

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), watchDevConfig(args)]);
};
