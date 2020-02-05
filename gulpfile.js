const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const watch = require('gulp-watch');
const glob = require('gulp-css-globbing');
const pump = require('pump');

const config = require('./gulpconfig.json');

const onError = function (err) {
  notify.onError({
    title: 'Gulp',
    subtitle: 'Failure!',
    message: 'Error: <%= error.message %>',
    sound: 'Beep'
  })(err);

  this.emit('end');
};

function buildCss(finished) {
  pump([
    gulp.src(config.source.vendorStyles.concat(config.source.styles)),
    plumber({
      errorHandler: onError
    }),
    sourcemaps.init(),
    glob({
      extensions: ['.scss']
    }),
    concat('main.min.css'),
    sass({
      includePaths: config.source.styleIncludePaths
    }),
    cleanCSS({
      inline: ['all']
    }),
    autoprefixer(),
    sourcemaps.write('.'),
    gulp.dest(config.dest.styles),
    notify({
      "title": "Gulp",
      "message": "CSS files were generated",
      "onLast": true
    })
  ], finished);
}

function buildJs(finished) {
  pump([
    gulp.src(config.source.vendorScripts.concat(config.source.scripts)),
    plumber({
      errorHandler: onError
    }),
    sourcemaps.init(),
    uglify(),
    concat('main.min.js'),
    sourcemaps.write('.'),
    gulp.dest(config.dest.scripts),
    notify({
      "title": "Gulp",
      "message": "JavaScript files were generated",
      "onLast": true
    })
  ], finished);
}

//* Uncomment the following lines if you want to also export the single tasks
// exports.buildCss = buildCss;
// exports.buildJs = buildJs;

function watchForChanges() {
  watch(config.source.vendorStyles.concat(config.source.styles), buildCss);
  watch(config.source.vendorScripts.concat(config.source.scripts), buildJs);
}

exports.watch = watchForChanges;
exports.build = gulp.parallel(buildCss, buildJs);
exports.default = gulp.series(exports.build, watchForChanges);
