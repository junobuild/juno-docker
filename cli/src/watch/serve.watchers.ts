import {isNullish} from '@dfinity/utils';
import type {CliContext} from '../types/context';
import {watchers} from './watchers';

export const serveWatchers = async ({
  context,
  ...request
}: {
  context: CliContext;
  command: string;
  subCommand: string;
  searchParams: URLSearchParams;
}): Promise<{processed: boolean}> => {
  const watcher = watchers.find((watcher) => watcher.matchRequest(request));

  if (isNullish(watcher)) {
    return {processed: false};
  }

  await watcher.onWatch({
    context
  });

  return {processed: true};
};
