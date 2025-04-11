import {watchDevConfig} from '../watch/config.watch';
import {watchDeploy} from '../watch/deploy.watch';
import {watchSatellite} from '../watch/watchers';

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), ...(watchSatellite ? [watchDevConfig(args)] : [])]);
};
