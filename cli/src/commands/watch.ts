import {InstallMode} from '@dfinity/ic-management';
import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {watch as fsWatch} from 'node:fs/promises';
import {
  DEV_DEPLOY_FOLDER,
  DEV_SATELLITE,
  DEV_SATELLITE_WASM_FILENAME
} from '../constants/constants';
import {SATELLITE, SatelliteModule} from '../modules/satellite';
import {buildContext} from '../services/context.services';
import type {CliContext} from '../types/context';

const {green} = kleur;

export const watch = async (args?: string[]) => {
  if (!existsSync(DEV_DEPLOY_FOLDER)) {
    console.log(
      `ℹ️  ${green(DEV_DEPLOY_FOLDER)} does not exist. Watching deployment files skipped.`
    );
    return;
  }

  console.log(`👀  Watching for deployment files.`);

  const context = await buildContext(args);

  const watcher = fsWatch(DEV_DEPLOY_FOLDER);
  for await (const $event of watcher) {
    await onFileWatch({$event, context});
  }
};

const onFileWatch = async ({
  $event: {eventType, filename},
  context
}: {
  $event: FileChangeInfo<string>;
  context: CliContext;
}) => {
  if (eventType !== 'change') {
    return;
  }

  if (filename !== DEV_SATELLITE_WASM_FILENAME) {
    return;
  }

  debounceUpgradeSatellite({context});
};

const upgradeSatellite = async ({context}: {context: CliContext}) => {
  const mod = new SatelliteModule({
    ...SATELLITE,
    wasmPath: DEV_SATELLITE
  });

  if (mod.isDeployed(context)) {
    console.log(`ℹ️  Satellite already deployed. No changes detected.`);
    return;
  }

  console.log(`🎬  New Satellite detected. Starting upgrade.`);

  await mod.install({...context, installMode: InstallMode.Upgrade});
};

const debounceUpgradeSatellite = debounce(upgradeSatellite);
