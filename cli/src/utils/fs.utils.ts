import {access} from 'node:fs/promises';

export const fileExist = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    } else {
      throw err;
    }
  }
};
