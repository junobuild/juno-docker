import type {HttpAgent, Identity} from '@dfinity/agent';
import {createAgent as createAgentUtils} from '@dfinity/utils';

export const createAgent = async ({
  identity,
  port
}: {
  identity: Identity;
  port: string | undefined;
}): Promise<HttpAgent> => {
  // TODO: Workaround for agent-js. Disable console.warn.
  // See https://github.com/dfinity/agent-js/issues/843
  // eslint-disable-next-line @typescript-eslint/prefer-destructuring
  const hideAgentJsConsoleWarn = globalThis.console.warn;
  globalThis.console.warn = (): null => null;

  try {
    return await createAgentUtils({
      identity,
      host: `http://localhost:${port}`,
      fetchRootKey: true
    });
  } finally {
    // Redo console.warn
    globalThis.console.warn = hideAgentJsConsoleWarn;
  }
};
