import {join} from 'node:path';

/**
 * Rust
 */

export const DEV_DEPLOY_FOLDER = join(process.cwd(), 'target', 'deploy');

export const DEV_SATELLITE_WASM_FILENAME = 'satellite.wasm.gz';
export const DEV_SATELLITE = join(DEV_DEPLOY_FOLDER, DEV_SATELLITE_WASM_FILENAME);

export const DEV_CONSOLE_WASM_FILENAME = 'console.wasm.gz';
export const DEV_CONSOLE = join(DEV_DEPLOY_FOLDER, DEV_CONSOLE_WASM_FILENAME);

export const DEV_OBSERVATORY_WASM_FILENAME = 'observatory.wasm.gz';
export const DEV_OBSERVATORY = join(DEV_DEPLOY_FOLDER, DEV_OBSERVATORY_WASM_FILENAME);

export const DEV_ORBITER_WASM_FILENAME = 'orbiter.wasm.gz';
export const DEV_MISSION_CONTROL_WASM_FILENAME = 'mission_control.wasm.gz';

export const DEV_METADATA = join(DEV_DEPLOY_FOLDER, 'metadata.json');

/**
 * Configuration
 */

export const JUNO_DEV_CONFIG_FILENAME = 'juno.dev.config'; // .json | .js | .cjs | .mjs | .ts

/**
 * JS/TS
 */

export const DEV_KIT_FOLDER = join(process.cwd(), 'kit');

export const DEV_SPUTNIK_MJS_FILENAME = 'index.sputnik.mjs';
export const DEV_BUILD_SPUTNIK = join(DEV_KIT_FOLDER, 'build', 'build-sputnik');
