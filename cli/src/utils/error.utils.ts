import {AgentError} from '@icp-sdk/core/agent';

export const prettifyError = (err: unknown): string | undefined =>
  typeof err === 'string'
    ? err
    : err instanceof AgentError
      ? err.code.toErrorMessage()
      : err instanceof Error
        ? err.message
        : undefined;
