import {isEmptyString} from '@dfinity/utils';
import {yellow} from 'kleur';
import {existsSync} from 'node:fs';
import {utimes} from 'node:fs/promises';
import {join} from 'node:path';
import {DEV_DEPLOY_FOLDER} from '../constants/dev.constants';

/**
 * Workaround Podman and Apple container issues on macOS:
 * - https://github.com/containers/podman/issues/22343
 * - https://github.com/apple/container/issues/141
 */
export const touchWatchedFile = async ({searchParams}: {searchParams: URLSearchParams}) => {
  const file = searchParams.get('file');

  if (isEmptyString(file)) {
    console.log(`ℹ️  Skipped touching file: no file provided.`);
    return;
  }

  const filename = decodeURIComponent(file);
  const filepath = join(DEV_DEPLOY_FOLDER, filename);

  if (!existsSync(filepath)) {
    console.log(`ℹ️  Skipped touching file: ${yellow(filepath)} does not exist.`);
    return;
  }

  await touch(filepath);
};

const touch = async (filePath: string) => {
  const now = new Date();
  await utimes(filePath, now, now);
};
