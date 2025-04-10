import {watchDevConfig} from '../watch/configs/dev-config.watch';
import {watchDeploy} from '../watch/deploy/deploy.watch';

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), watchDevConfig(args)]);
};
