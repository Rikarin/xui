import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import gulp from 'gulp';
import { readFileSync, writeFileSync } from 'fs';

export function setVersion(project) {
  const packagePath = `../../dist/libs/${project}/package.json`;

  gulp.task('patch-dist', done => {
    const argv = yargs(hideBin(process.argv)).argv;
    const version = argv['version'];
    if (!version) {
      done(new Error('Missing version'));
    }

    const data = JSON.parse(readFileSync(packagePath));
    data.version = version;

    const replace = payload => {
      for (const name in payload) {
        if (name.startsWith('@xui/')) {
          payload[name] = version;
        }
      }
    };

    replace(data.peerDependencies);
    replace(data.dependencies);

    writeFileSync(packagePath, JSON.stringify(data, null, 2));
    done();
  });

  gulp.task('update-package-version', done => {
    const data = JSON.parse(readFileSync(packagePath));
    const version = data.peerDependencies['@angular/core'];
    if (version) {
      for (const x in data.peerDependencies) {
        if (x.startsWith('@angular/')) {
          data.peerDependencies[x] = version;
        }
      }

      writeFileSync(packagePath, JSON.stringify(data, null, 2));
    }

    done();
  });
}
