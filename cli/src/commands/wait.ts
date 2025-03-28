import type {HttpAgent} from '@dfinity/agent';
import {buildContext} from '../services/context.services';

export const wait = async (args?: string[]) => {
  const {agent} = await buildContext(args);

  // 10 seconds from now
  const timeout = Date.now() + 10_000;

  while (Date.now() < timeout) {
    const healthy = await isReplicaHealthy(agent);

    if (healthy) {
      return;
    }
  }

  throw new Error('Replica appears to be unhealthy despite waiting for its startup.');
};

const isReplicaHealthy = async (agent: HttpAgent): Promise<boolean> => {
  try {
    const {replica_health_status} = await agent.status();

    return replica_health_status === 'healthy';
  } catch (_err: unknown) {
    // We ignore the errors here
    return false;
  }
};
