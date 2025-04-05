import {isEmptyString, isNullish} from '@dfinity/utils';
import {execute, type PackageJson} from '@junobuild/cli-tools';
import {
  DEV_BUILD_SPUTNIK,
  DEV_PREPARE_PKG_SPUTNIK,
  DEV_SPUTNIK_MJS_FILE_PATH
} from '../constants/dev.constants';

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
  const metadata = await buildMetadata();

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

const buildMetadata = async (): Promise<
  Pick<PackageJson, 'name' | 'version'> | undefined | null
> => {
  try {
    const {__juno_package__} = await import(DEV_SPUTNIK_MJS_FILE_PATH);

    const {juno, name, version} = __juno_package__;

    return {
      name: juno?.functions?.name ?? name,
      version: juno?.functions?.version ?? version
    };
  } catch (_err: unknown) {
    // The build will be skipped.
    return undefined;
  }
};
