import {watchDeploy} from '../watch/deploy.watch';

export const watch = async (args?: string[]) => {
  await watchDeploy(args);
};
