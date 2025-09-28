import {assertNonNullish} from '@dfinity/utils';
import {DEV_SATELLITE_WASM_FILENAME} from '../../constants/dev.constants';
import {initSatelliteDynamicModule} from '../../modules/satellite/dynamic';
import type {CliContext} from '../../types/context';
import type {InitDynamicModuleResult} from '../../types/module';
import {DeployWatcher} from '../../watch/_watchers/deploy.watcher';

export const upgradeSatellite = async ({
  context,
  searchParams
}: {
  context: CliContext;
  searchParams: URLSearchParams;
}) => {
  const satelliteId = searchParams.get('id');

  assertNonNullish(satelliteId, 'The request must provide a satellite ID.');

  const satelliteDynamicWatcher = new DeployWatcher({
    moduleFileName: DEV_SATELLITE_WASM_FILENAME,
    initModule: async ({context}: {context: CliContext}): Promise<InitDynamicModuleResult> =>
      await initSatelliteDynamicModule({context, satelliteId})
  });

  await satelliteDynamicWatcher.onRequest({context});
};
