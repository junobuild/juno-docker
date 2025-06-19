import type {ConsoleParameters} from '@junobuild/cdn';
import {MAIN_IDENTITY_KEY} from '../../constants/constants';
import type {CliContext} from '../../types/context';
import type {ModuleMetadata} from '../../types/module';

export type ConsoleConfigContext = CliContext & Pick<ModuleMetadata, 'canisterId'>;

export const buildConsoleParams = ({
  canisterId,
  identities: {[MAIN_IDENTITY_KEY]: identity}
}: ConsoleConfigContext): ConsoleParameters => ({
  consoleId: canisterId,
  identity,
  container: true
});
