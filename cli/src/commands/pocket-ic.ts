import {configPocketIC} from '../services/pocket-ic.services';

export const pocketIC = async (args?: string[]) => {
  const [subCommand] = args ?? [];

  switch (subCommand) {
    case 'config':
      await configPocketIC(args);
  }
}