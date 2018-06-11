var gulp = require('gulp'),
  babel = require('gulp-babel'),
  del = require('del'),
  sass = require('gulp-sass'),
  notify = require('gulp-notify'),
  uglify = require('gulp-uglify'),
  cssnano = require('gulp-cssnano'),
  rename = require('gulp-rename'),
  concat = require('gulp-concat'),
  dirSync = require('gulp-directory-sync'),
  watch = require('gulp-watch'),
  sourcemaps = require('gulp-sourcemaps'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  autoprefixer = require('gulp-autoprefixer'),
  standard = require('gulp-standard'),
  browserSync = require('browser-sync').create()

var config = {
    npmDir: './node_modules',
    publicRootDir: './dist'
  },
  srcs = {
    scss: './src/core',
    js: './src/js',
    fonts: './src/fonts',
    img: './src/images'

  }, dests = {
    css: config.publicRootDir + '/css',
    js: config.publicRootDir + '/js',
    fonts: config.publicRootDir + '/fonts',
    img: config.publicRootDir + '/images'
  }

gulp.task('clean', function () {
  return del(['dist/css'])
})

gulp.task('sync-fonts', function () {
  return gulp.src(srcs.fonts + '/**/*', {base: srcs.fonts})
    .pipe(dirSync(srcs.fonts, dests.fonts, {printSummary: false, ignore: '.gitignore'}))
    //.pipe(watch(srcs.fonts, {base: srcs.fonts}))
    .pipe(gulp.dest(dests.fonts))
    .on('error', notify.onError(function (error) {
      return 'Error: ' + error.message
    }))
})

gulp.task('sync-images', function () {
  return gulp.src(srcs.img + '/**/*', {base: srcs.img})
  //.pipe(watch(srcs.img, {base: srcs.img}))
    .pipe(imagemin({
      progressive: true,
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dests.img))
    .pipe(dirSync(srcs.img, dests.img, {printSummary: false, ignore: '.gitignore'}))
    .on('error', notify.onError(function (error) {
      return 'Error: ' + error.message
    }))
})

gulp.task('icons', function () {
  return gulp.src(config.npmDir + '/@fortawesome/fontawesome-free-webfonts/webfonts/**.*').pipe(gulp.dest(dests.fonts))
})

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
        srcs.scss,
        config.npmDir + '/bootstrap-multi-direction/src/scss',
        config.npmDir + '/mappy-breakpoints',
        config.npmDir + '/@fortawesome/fontawesome-free-webfonts/scss'
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
  gulp.src(srcs.js + '/**/*.js')
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(gulp.dest(dests.js))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify().on('error', notify.onError(function (error) {
      return 'Error compiling JavaScript: ' + error.message
    })))
    .pipe(gulp.dest(dests.js))
})

gulp.task('standard', function () {
  return gulp.src(srcs.js + '/**/*.js')
    .pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true
    }))
})

gulp.task('watch', function () {
  gulp.watch(srcs.scss + '/**/*.scss', ['css'])
  gulp.watch(srcs.js + '/**/*.js', ['scripts'])
  gulp.watch(srcs.js + '/**/*.js', ['standard'])
})

gulp.task('default', ['clean', 'sync-fonts', 'sync-images', 'icons', 'css', 'browser-sync', 'scripts', 'standard', 'watch'])
