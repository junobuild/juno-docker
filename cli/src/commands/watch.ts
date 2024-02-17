import {debounce} from '@dfinity/utils';
import type {FileChangeInfo} from 'fs/promises';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {watch as fsWatch} from 'node:fs/promises';
import {DEV_DEPLOY_FOLDER, DEV_SATELLITE_WASM_FILENAME} from '../constants/constants';
import {initSatelliteModule, type SatelliteModule} from '../modules/satellite';
import {JUNO_DEV_CONFIG, configExist} from '../modules/satellite/satellite.config';
import {buildContext} from '../services/context.services';
import type {CliContext} from '../types/context';

const {green} = kleur;

export const watch = async (args?: string[]) => {
  await Promise.all([watchDeploy(args), watchConfig(args)]);
};

const watchConfig = async (args?: string[]) => {
  if (!(await configExist())) {
    console.log(`ℹ️  No configuration file provided. Watching for config updates skipped.`);
    return;
  }

  console.log(`👀  Watching for config updates.`);

  const context = await buildContext(args);

  const watcher = fsWatch(JUNO_DEV_CONFIG);
  for await (const $event of watcher) {
    await onConfigFileWatch({$event, context});
  }
};

const onConfigFileWatch = async ({
  $event: {eventType},
  context
}: {
  $event: FileChangeInfo<string>;
  context: CliContext;
}) => {
  if (eventType !== 'change') {
    return;
  }

  debounceConfigSatellite({context});
};

const updateConfig = async ({context}: {context: CliContext}) => {
  console.log(`🎬  New config detected. Starting update of the configuration.`);

  const mod = initSatelliteModule();

  await mod.config(context);
};

const debounceConfigSatellite = debounce(updateConfig, 5000);

const watchDeploy = async (args?: string[]) => {
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
    await onDeployFileWatch({$event, context});
  }
};

const onDeployFileWatch = async ({
  $event: {filename},
  context
}: {
  $event: FileChangeInfo<string>;
  context: CliContext;
}) => {
  if (filename !== DEV_SATELLITE_WASM_FILENAME) {
    return;
  }

  if (upgrading) {
    requestUpgrade = true;
    return;
  }

  debounceUpgradeSatellite({context});
};

let upgrading = false;
let requestUpgrade = false;

const upgradeSatellite = async ({context}: {context: CliContext}) => {
  upgrading = true;

  const mod = initSatelliteModule();

  if (mod.isDeployed(context)) {
    upgrading = false;
    console.log(`ℹ️  Satellite already deployed. No changes detected.`);

    await processPendingUpgrade({context});
    return;
  }

  await executeUpgrade({context, mod});

  await processPendingUpgrade({context});
};

const executeUpgrade = async ({context, mod}: {context: CliContext; mod: SatelliteModule}) => {
  try {
    console.log(`🎬  New Satellite detected. Starting upgrade.`);

    await mod.install(context);
  } finally {
    upgrading = false;
  }
};

const processPendingUpgrade = async ({context}: {context: CliContext}) => {
  if (!requestUpgrade) {
    return;
  }

  requestUpgrade = false;
  await upgradeSatellite({context});
};

const debounceUpgradeSatellite = debounce(upgradeSatellite);
