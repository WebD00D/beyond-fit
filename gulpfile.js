var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('default',['watch'], function() {
    console.log('Running Gulp');
});

gulp.task('sass',function(){
  return gulp.src('static/scss/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('static/css'))
})

gulp.task('watch',function(){
  gulp.watch(['static/scss/*.scss'], ['sass']);
})
