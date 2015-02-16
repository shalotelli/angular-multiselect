'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    htmlmin = require('gulp-htmlmin'),
    jshintreporter = require('jshint-summary'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngTemplates = require('gulp-ng-templates'),
    concat = require('gulp-concat'),
    karma = require('karma').server,
    server = require('gulp-server-livereload');

var files = {};

files.test = [];
files.css = [ 'styles/multi-select.css'];
files.src = ['release/templates.min.js', 'multiselect.js'];
files.templates = ['views/**/*.html'];
files.destination = 'release/';

gulp.task('templates', function () {
  return gulp.src(files.templates)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(ngTemplates({
      filename: 'templates.js',
      module: 'shalotelli-angular-multiselect.templates',
      path: function (path, base) {
        return path.replace(base, '/');
      }
    }))
    .pipe(gulp.dest('release/'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('release/'));
});

gulp.task('scripts', ['templates'], function() {
  return gulp.src(files.src)
    .pipe(concat('multiselect.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest(files.destination))
    .pipe(rename(function(path){
      //this is needed so we dont rename the map file
      if(path.extname === '.js') {
        path.basename += '.min';
      }
    }))
    .pipe(uglify({
      preserveComments: 'some',
      outSourceMap: true
    }))
    .pipe(gulp.dest(files.destination));
});


//this is just for css (we can do sass later)
gulp.task('copy', function(){
  gulp.src(files.css)
  .pipe(gulp.dest(files.destination + 'styles/'));
});


gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});

gulp.task('clean', function(cb) {
  del([files.destination + 'styles/', files.destination], cb);
});

gulp.task('serve', function () {
  gulp.src(__dirname)
    .pipe(server({
      livereload: true,
      port: 8000,
      defaultFile: 'demo/demo.html',
      open: true
    }));
});

gulp.task('demo',[ 'copy', 'scripts', 'test', 'serve' ]);

gulp.task('default', [ 'copy', 'scripts' ]);
