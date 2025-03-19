import {readFileSync} from 'atomically';
import {join} from 'node:path';
import {DEV_DEPLOY_FOLDER, DEV_METADATA} from '../../constants/constants';
import {installRelease} from '../../services/console.services';
import type {CliContext} from '../../types/context';
import type {WatcherConsoleInstallDescription} from '../../types/watcher';
import {Watcher} from './_watcher';

export class ConsoleInstallWatcher extends Watcher {
  readonly #key: string;
  readonly #name: string;

  constructor({moduleFileName, key, name}: WatcherConsoleInstallDescription) {
    super({moduleFileName});
    this.#key = key;
    this.#name = name;
  }

  protected async onExec({context}: {context: CliContext}) {
    try {
      console.log(`📡  New ${this.#name} detected. Starting upload to Console.`);

      const metadata = JSON.parse(readFileSync(DEV_METADATA, {encoding: 'utf-8'}));
      // eslint-disable-next-line @typescript-eslint/prefer-destructuring, @typescript-eslint/no-unsafe-member-access
      const version = metadata[this.#key.replaceAll('-', '_')];

      await installRelease({
        context,
        wasmPath: join(DEV_DEPLOY_FOLDER, this.moduleFileName),
        version,
        key: this.#key,
        name: this.#name
      });
    } finally {
      this.executing = false;
    }
  }
}
