import {Ed25519KeyIdentity} from '@dfinity/identity';
import {nonNullish} from '@dfinity/utils';
import type {CliState} from '../states/cli.state';

export const getIdentity = (config: CliState): Ed25519KeyIdentity => {
  const token = config.getToken();

  if (nonNullish(token)) {
    return Ed25519KeyIdentity.fromParsedJson(token);
  }

  const identity = Ed25519KeyIdentity.generate();
  config.saveToken(identity.toJSON());

  return identity;
};
