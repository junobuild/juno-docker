import type {HttpAgent} from '@icp-sdk/core/agent';
import {buildContext} from '../services/context.services';

export const wait = async (args?: string[]) => {
  const {agent} = await buildContext(args);

  // 20 seconds from now
  const timeout = Date.now() + 20_000;

  while (Date.now() < timeout) {
    const healthy = await isReplicaHealthy(agent);

    if (healthy) {
      return;
    }
  }

  throw new Error('Replica appears to be unhealthy despite waiting for its startup.');
};

const isReplicaHealthy = async (agent: HttpAgent): Promise<boolean> => {
  // TODO: Workaround for agent-js. Disable console.warn.
  // See https://github.com/dfinity/agent-js/issues/843
  // eslint-disable-next-line @typescript-eslint/prefer-destructuring
  const hideAgentJsConsoleWarn = globalThis.console.warn;
  globalThis.console.warn = (): null => null;

  try {
    const {replica_health_status} = await agent.status();

    return replica_health_status === 'healthy';
  } catch (_err: unknown) {
    // We ignore the errors here
    return false;
  } finally {
    // Redo console.warn
    globalThis.console.warn = hideAgentJsConsoleWarn;
  }
};
