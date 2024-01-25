import {join} from 'node:path';

export const NODE_20 = 20;
export const CLI_PROJECT_NAME = 'juno';

export const DEV_DEPLOY_FOLDER = join(process.cwd(), 'target', 'deploy');
export const DEV_SATELLITE_WASM_FILENAME = 'satellite.wasm.gz';
export const DEV_SATELLITE = join(DEV_DEPLOY_FOLDER, DEV_SATELLITE_WASM_FILENAME);
