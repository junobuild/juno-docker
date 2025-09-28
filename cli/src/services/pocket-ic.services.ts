import {nextArg} from '@junobuild/cli-tools';

export const configPocketIC = async () => {
  const port = nextArg({args, option: '-p'}) ?? nextArg({args, option: '--port'});
}

