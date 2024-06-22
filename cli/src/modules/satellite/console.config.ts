import type {ConsoleParameters} from '@junobuild/console';
import fetch from 'node-fetch';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';

export type ConsoleConfigContext = CliContext & Pick<ModuleMetadata, 'canisterId'>;

export const buildConsoleParams = ({
  canisterId,
  identities: {[MAIN_IDENTITY_KEY]: identity}
}: ConsoleConfigContext): ConsoleParameters => ({
  consoleId: canisterId,
  // TODO: TypeScript incompatibility window.fetch vs nodejs.fetch vs agent-ts using typeof fetch
  // @ts-expect-error
  fetch,
  identity,
  container: true
});
