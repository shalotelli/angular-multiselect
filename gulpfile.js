var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  del = require('del'),
  rename = require('gulp-rename'),
  jshint = require('gulp-jshint'),
  jshintreporter = require('jshint-summary'),
  ngAnnotate = require('gulp-ng-annotate'),
  ngTemplates = require('gulp-ng-templates'),
  concat = require('gulp-concat'),
  files = {};


files.test = [];
files.src = ['multiselect.js'];
files.destination = 'release/';


gulp.task('test', function() {
  return gulp.src(files.test)
    .pipe(qunit());
});

gulp.task('clean', function(cb) {
  del(files.destination, cb);
});

gulp.task('scripts', function() {
  return gulp.src(files.src)
    .pipe(concat('multiselect.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest(files.destination))
    .pipe(uglify({
      preserveComments: 'some',
      outSourceMap: true
    }))
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(gulp.dest(files.destination));


});




gulp.task('default', ['clean', 'scripts']);
