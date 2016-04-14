const gulp  = require('gulp'),
    babel = require('gulp-babel')
    watch = require('gulp-watch')
    env = process.env.NODE_ENV || 'dev',
    uglify = require('gulp-uglify'),
    react = require('gulp-react');

const paths = {
  babel: 'app/*.jsx',
  build: 'app/dist'
};

gulp.task('build', () => {
    return gulp
      .src(paths.babel)
      .pipe(react({harmony: false, es6module: true}))
      .pipe(babel({
  		presets: ['es2015']
  	}))
    .pipe(uglify())
    .pipe(gulp.dest(paths.build));
});

gulp.task('watch', ['build'], () => {
  return watch(paths.babel, () => {
    gulp.start(['build']);
  });
});

gulp.task('default', ['watch']);
