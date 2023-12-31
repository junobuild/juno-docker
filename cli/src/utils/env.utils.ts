import kleur from 'kleur';
import {major} from 'semver';
import {NODE_20} from '../constants/constants';

const {green, yellow} = kleur;

export const checkNodeVersion = (): {valid: boolean} => {
  try {
    const {version} = process;
    const nodeMajor = major(version);

    if (nodeMajor < NODE_20) {
      console.log(
        `Your version of Node is ${yellow(`${version}`)}. This CLI requires Node ${green(
          `${NODE_20}`
        )} or a more recent version.`
      );
      return {valid: false};
    }
  } catch (e) {
    console.error(`Cannot detect your Node runtime version. Is NodeJS installed on your machine?`);
    return {valid: false};
  }

  return {valid: true};
};
