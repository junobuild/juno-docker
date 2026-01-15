import {isEmptyString, isNullish, nonNullish} from '@dfinity/utils';
import {execute, type PackageJson} from '@junobuild/cli-tools';
import {readFileSync} from 'atomically';
import kleur from 'kleur';
import {
  DEV_BUILD_SPUTNIK,
  DEV_PREPARE_PKG_SPUTNIK,
  DEV_SPUTNIK_MJS_FILE_PATH
} from '../../constants/dev.constants';

const {red} = kleur;

export const buildSputnik = async () => {
  const {success} = await generateMetadata();

  if (!success) {
    return;
  }

  await execute({
    command: DEV_BUILD_SPUTNIK
  });
};

const generateMetadata = async (): Promise<{success: boolean}> => {
  const {result: metadata, err} = await buildMetadata();

  if (nonNullish(err)) {
    console.log(red('️‼️  Error reading metadata.'));
    console.log(err);
    return {success: false};
  }

  if (isNullish(metadata?.name) || isEmptyString(metadata.name)) {
    console.log(`⚠️  Missing "name" in package metadata. Aborting build!`);
    return {success: false};
  }

  if (isNullish(metadata.version) || isEmptyString(metadata.version)) {
    console.log(`⚠️  Missing "version" in package metadata. Aborting build!`);
    return {success: false};
  }

  const {name, version} = metadata;

  await execute({
    command: DEV_PREPARE_PKG_SPUTNIK,
    args: ['--name', name, '--version', version]
  });

  return {success: true};
};

const buildMetadata = async (): Promise<{
  result: Pick<PackageJson, 'name' | 'version'> | undefined | null;
  err?: unknown;
}> => {
  try {
    const mjs = readFileSync(DEV_SPUTNIK_MJS_FILE_PATH, 'utf-8');
    // eslint-disable-next-line prefer-named-capture-group, require-unicode-regexp
    const banner = /^\/\/\s*@juno:package\s+({.*})/.exec(mjs);

    if (isNullish(banner)) {
      return {
        result: null,
        err: new Error(
          `⚠️  Missing Juno package metadata banner at the top of ${DEV_SPUTNIK_MJS_FILE_PATH}. Aborting build!`
        )
      };
    }

    const [_fullMatch, match] = banner;
    const {juno, name, version}: PackageJson = JSON.parse(match);

    const result = {
      name: juno?.functions?.name ?? name,
      version: juno?.functions?.version ?? version
    };

    return {result};
  } catch (err: unknown) {
    return {
      result: undefined,
      err
    };
  }
};
