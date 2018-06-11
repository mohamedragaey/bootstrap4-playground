var gulp = require('gulp'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  watch = require('gulp-watch'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  browserSync = require('browser-sync').create()

var config = {
    npmDir: './node_modules',
    publicRootDir: './dist'
  },
  srcs = {
    scss: './core',
    js: './js'
  }, dests = {
    css: config.publicRootDir + '/css',
    js: config.publicRootDir + '/js'
  }

gulp.task('browser-sync', ['css'], function () {
  browserSync.init({
    server: config.publicRootDir
  })
  gulp.watch(config.publicRootDir + '/**/*.html').on('change', browserSync.reload) // reload on html changes.
})

gulp.task('css', function () {
  return gulp.src([
    srcs.scss + '/app-rtl.scss', // Use it with LTR/RTL styles
    srcs.scss + '/app.scss'
  ])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sass({
      style: 'expanded',
      includePaths: [
        srcs.scss
      ]
    }).on('error', notify.onError(function (error) {
      return 'Error: ' + error.message
    })))
    // auto prefix and keep last two browser versions
    .pipe(autoprefixer({
      browsers: ['last 2 versions', 'safari 5', 'ie 11', 'opera 12.1', 'ios 6', 'android 4']
    }))
    .pipe(gulp.dest(dests.css))
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({discardComments: {removeAll: true}}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dests.css))
    .pipe(browserSync.stream())
})
gulp.task('scripts', function () {
  gulp.src([
//        ## Include jQuery to your grouped JavaScript file if it is not already included within your page context.
    config.npmDir + '/jquery/dist/jquery.js',
    config.npmDir + '/popper',
//
//        ## Include needed Bootstrap component from following scripts
    config.npmDir + '/bootstrap/js/dist/util.js',
    config.npmDir + '/bootstrap/js/dist/collapse.js',
    config.npmDir + '/bootstrap/js/dist/alert.js',
    config.npmDir + '/bootstrap/js/dist/button.js',
    config.npmDir + '/bootstrap/js/dist/carousel.js',
    config.npmDir + '/bootstrap/js/dist/dropdown.js',
    config.npmDir + '/bootstrap/js/dist/modal.js',
    config.npmDir + '/bootstrap/js/dist/popover.js',
    config.npmDir + '/bootstrap/js/dist/scrollspy.js',
    config.npmDir + '/bootstrap/js/dist/tab.js',
    config.npmDir + '/bootstrap/js/dist/tooltip.js',

    srcs.js + '/scripts.js'
  ])
    .pipe(concat('app.js'))
    .pipe(gulp.dest(dests.js))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify().on('error', notify.onError(function (error) {
      return 'Error compiling JavaScript: ' + error.message
    })))
    .pipe(gulp.dest(dests.js))
})

gulp.task('watch', function () {
  gulp.watch(srcs.scss + '/**/*.scss', ['css'])
  gulp.watch(srcs.js + '/**/*.js', ['scripts'])
})

gulp.task('default', ['css', 'scripts', 'watch'])
