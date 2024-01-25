import {InstallMode} from '@dfinity/ic-management';
import type {FileChangeInfo} from 'fs/promises';
import kleur from 'kleur';
import {existsSync} from 'node:fs';
import {watch as fsWatch} from 'node:fs/promises';
import {join} from 'node:path';
import {SATELLITE, SatelliteModule} from '../modules/satellite';
import {buildContext} from '../services/context.services';
import type {CliContext} from '../types/context';

const {green} = kleur;

const JUNO_DEPLOY_FOLDER = join(process.cwd(), 'target', 'deploy');

export const watch = async (args?: string[]) => {
  if (!existsSync(JUNO_DEPLOY_FOLDER)) {
    console.log(
      `ℹ️  ${green(JUNO_DEPLOY_FOLDER)} does not exist. Watching deployment files skipped.`
    );
    return;
  }

  console.log(`👀  Watching for deployment files.`);

  const context = await buildContext(args);

  const watcher = fsWatch(JUNO_DEPLOY_FOLDER);
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

  if (filename !== 'satellite.wasm.gz') {
    return;
  }

  const mod = new SatelliteModule({
    ...SATELLITE,
    wasmPath: join(JUNO_DEPLOY_FOLDER, filename)
  });

  if (mod.isDeployed(context)) {
    console.log(`ℹ️  Satellite already deployed. No changes detected.`);
    return;
  }

  await mod.install({...context, installMode: InstallMode.Upgrade});
};
