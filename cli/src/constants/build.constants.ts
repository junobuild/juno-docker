import {join} from 'node:path';

export const DEV_KIT_FOLDER = join(process.cwd(), 'kit');

export const DEV_SPUTNIK_MJS_FILENAME = 'index.sputnik.mjs';
export const DEV_BUILD_SPUTNIK = join(DEV_KIT_FOLDER, 'build', 'build-sputnik');
