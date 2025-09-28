export const dispatchRequest = async <T>({
  replicaPort,
  request,
  body,
  timeout = 30000
}: {
  body: T;
  replicaPort: string;
  request: string;
  timeout?: number;
}): Promise<
  | {result: 'ok'; response: Response}
  | {result: 'not_ok'; response: Response}
  | {result: 'error'; err: unknown}
> => {
  try {
    const response = await fetch(`http://localhost:${replicaPort}/${request}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(timeout),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return {result: 'not_ok', response};
    }

    return {result: 'ok', response};
  } catch (err: unknown) {
    return {result: 'error', err};
  }
};
