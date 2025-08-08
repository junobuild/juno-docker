import {existsSync} from 'node:fs';
import {join} from 'node:path';
import {DEV_DEPLOY_FOLDER} from '../../constants/dev.constants';
import {installRelease} from '../../services/modules/console.services';
import type {ModuleInstallParams} from '../../types/module';
import {satellite} from '../satellite';
import {
  MISSION_CONTROL_KEY,
  MISSION_CONTROL_NAME,
  ORBITER_KEY,
  ORBITER_NAME
} from './console.constants';

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
    // Useful for E2E testing. This way the emulator boots with a Console that is loaded
    // with the latest locally developed version of the modules.
    const watchWasmPath = join(DEV_DEPLOY_FOLDER, `${key}.wasm.gz`);
    const stockWasmPath = `./target/${key}.gz`;

    const wasmPath = existsSync(watchWasmPath) ? watchWasmPath : stockWasmPath;

    await installRelease({
      context,
      wasmPath,
      version: '0.0.1',
      key,
      name
    });
  });

  await Promise.all(promises);
};
