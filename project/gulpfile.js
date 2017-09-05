const gulp = require('gulp');
const connect = require('gulp-connect');

gulp.task('connect', function() {
	return connect.server({
		port: 5000,
		root: 'app'
	});
});

gulp.task('default', ['connect']);
