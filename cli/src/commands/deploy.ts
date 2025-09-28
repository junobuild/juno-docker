import {isNullish} from '@dfinity/utils';
import kleur from 'kleur';
import {modules, troublemakers} from '../modules/modules';
import {buildContext} from '../services/context.services';
import type {Module} from '../services/modules/module.services';
import type {CliContext} from '../types/context';

const {green, cyan, red} = kleur;

export const deploy = async (args?: string[]) => {
  const context = await buildContext(args);

  await deployModules({
    context,
    mods: modules,
    installFn: installModulesParallel,
    postInstallFn: postInstallModulesParallel
  });
  await deployModules({
    context,
    mods: troublemakers,
    installFn: installModulesSerial,
    postInstallFn: postInstallModulesSerial
  });
};

interface DeployModulesParams {
  context: CliContext;
  mods: Module[];
  installFn: InstallModulesFn;
  postInstallFn: PostInstallModulesFn;
}

type InstallModulesFn = (params: {context: CliContext; mods: Module[]}) => Promise<void>;

type PostInstallModulesFn = (params: {context: CliContext; mods: Module[]}) => Promise<void>;

const deployModules = async ({context, mods, installFn, postInstallFn}: DeployModulesParams) => {
  // 1. Create canisters that do not exist yet
  await Promise.all(
    mods
      .filter((mod) => mod.status(context) === undefined)
      .map(async (mod) => {
        await mod.prepare(context);
      })
  );

  // 2. Split the canister already deployed and those which still need to be installed
  const [deployed, rest] = mods.reduce(
    ([deployed, rest]: [Module[], Module[]], mod) => {
      const ready = mod.isDeployed(context);

      return [
        [...deployed, ...(ready ? [mod] : [])],
        // eslint-disable-next-line no-negated-condition
        [...rest, ...(!ready ? [mod] : [])]
      ];
    },
    [[], []]
  );

  // 3. Print out the list of those already deployed
  await Promise.all(
    deployed.map(async (mod) => {
      const id = mod.canisterId(context);

      if (isNullish(id)) {
        console.log(`⚠️  ${red(mod.name)} was not initialized. This is unexpected!`);
        return;
      }

      console.log(`🆗  ${green(mod.name)} already exists. Skipping deployment. ID: ${cyan(id)}`);
    })
  );

  // 4. Deploy / install code in the not yet populated canisters
  await installFn({context, mods: rest});

  // 5. Some canisters may require post installation configuration that needs to be executed only once like that dev-painful Governance canister
  await postInstallFn({context, mods: rest});
};

const installModulesParallel = async ({context, mods}: {context: CliContext; mods: Module[]}) => {
  await Promise.all(
    mods.map(async (mod) => {
      await mod.install(context);
    })
  );
};

const postInstallModulesParallel = async ({
  context,
  mods
}: {
  context: CliContext;
  mods: Module[];
}) => {
  await Promise.all(
    mods.map(async (mod) => {
      await mod.postInstall(context);
    })
  );
};

// Installing one after the other is slower 😢
const installModulesSerial = async ({context, mods}: {context: CliContext; mods: Module[]}) => {
  for (const mod of mods) {
    await mod.install(context);
  }
};

const postInstallModulesSerial = async ({context, mods}: {context: CliContext; mods: Module[]}) => {
  for (const mod of mods) {
    await mod.postInstall(context);
  }
};
