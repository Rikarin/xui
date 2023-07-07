import gulp from 'gulp';
import { setVersion } from './version.mjs';

export function projectTasks(project) {
  // TODO: copy readme
  // "copy-readme": "cp README.md libs/xui/README.md && git add libs/xui/README.md",
  // automatically set current year
  // generate schematics for simpler usage
  setVersion(project);
  gulp.task('post-build', gulp.parallel('update-package-version'));
}
