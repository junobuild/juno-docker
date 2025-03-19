import {installRelease} from '../../services/console.services';
import type {ModuleInstallParams} from '../../types/module';
import {
  MISSION_CONTROL_KEY,
  MISSION_CONTROL_NAME,
  ORBITER_KEY,
  ORBITER_NAME
} from '../../watch/modules/console';
import {satellite} from '../satellite';

export const installReleases = async (context: ModuleInstallParams) => {
  const promises = [
    {
      key: satellite.key,
      name: satellite.name
    },
    {
      key: MISSION_CONTROL_KEY,
      name: MISSION_CONTROL_NAME
    },
    {key: ORBITER_KEY, name: ORBITER_NAME}
  ].map(async ({key, name}) => {
    await installRelease({
      context,
      wasmPath: `./target/${key}.gz`,
      version: '0.0.1',
      key,
      name
    });
  });

  await Promise.all(promises);
};
