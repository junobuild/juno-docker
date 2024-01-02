import {Ed25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import type {CliConfig} from '../configs/cli.config';

export const getIdentity = (config: CliConfig): Ed25519KeyIdentity => {
  const token = config.getToken();

  if (nonNullish(token)) {
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const identity = Ed25519KeyIdentity.generate();
  config.saveToken(identity.toJSON());

  return identity;
};
