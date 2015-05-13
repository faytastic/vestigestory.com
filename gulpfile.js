/* jshint -W069, -W079 */

/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 *
 *  This software is released under the MIT License:
 *  http://www.opensource.org/licenses/mit-license.php
 */

'use strict';
// generated on 2015-04-17 using generator-vars-webapp 0.1.7

// Patterns.
var IMAGES_PATTERN = '{jpg,jpeg,gif,png,svg,ico}';
var VIDEOS_PATTERN = '{ogv,mp4}';
var SCRIPTS_PATTERN = 'js';
var STYLES_PATTERN = '{css,scss}';
var TEMPLATES_PATTERN = '{html,shtml,htm,html.erb,asp,php}';
var EXTRAS_PATTERN = '{txt,htaccess}';
var FONTS_PATTERN = '{eot,svg,ttf,woff,woff2}';
var FILE_EXCLUDE_PATTERN = '{psd,ai}';

// Load modules.
var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var sequence = require('run-sequence');

/**
 * Compresses and deploys images to the build directory. Compression is skipped if --debug is specified.
 */
gulp.task('images', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var skipImageMin = $.util.env['skip-imagemin'] || debug;

    return gulp.src(['app/**/*'+IMAGES_PATTERN])
        .pipe($.if(!skipImageMin, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{cleanupIDs: false}]
        }))))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Compresses and deploys videos to the build directory. Compression is skipped if --debug is specified.
 */
gulp.task('videos', function()
{
    return gulp.src(['app/**/*'+VIDEOS_PATTERN])
        .pipe(gulp.dest('.tmp'));
});

/**
 * Deploys all fonts from Bower components if applicable.
 */
gulp.task('fonts', function()
{
    return gulp.src(require('main-bower-files')({ filter: '**/*.'+FONTS_PATTERN }).concat('app/fonts/**/*'))
        .pipe(gulp.dest('.tmp/fonts'));
});

/**
 * Processes all CSS files if preprocessed CSS languages are used (i.e. Stylus, Sass). Copies the processed
 * files to a temporary directory to be iterated on in subsequent tasks. Minification is done in the main 'build' task.
 */
gulp.task('styles', function()
{
    return gulp.src('app/**/*.'+STYLES_PATTERN)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.postcss([require('autoprefixer-core')({ browsers: ['last 2 version', 'ie 9'] })]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp'));
});

/**
 * Processes and lints all JavaScript files. If Browserify is included this task will bundle up all associated files. Processed
 * JavaScript files are copied to a temporary directory to be iterated on in subsequent tasks. Uglification is done in the main
 * 'build' task.
 */
gulp.task('scripts', function()
{
    var browserify = require('browserify');
    var reactify = require('reactify');
    var through = require('through2');

    return gulp.src(['./app/scripts/*.'+SCRIPTS_PATTERN])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe(through.obj(function(file, enc, next)
        {
            browserify({ entries: [file.path], debug: true, transform: [reactify] })
                .bundle(function(err, res)
                {
                    if (err) console.log(err.toString());
                    file.contents = res;
                    next(null, file);
                });
        }))
        .pipe($.sourcemaps.init({ loadMaps: true }))
        .pipe($.sourcemaps.write('./'))
        .pipe(gulp.dest('.tmp/scripts'));
});

/**
 * Deploys other miscellaneous files if applicable to the temporary directory.
 */
gulp.task('extras', function()
{
    return gulp.src(['app/**/*.'+EXTRAS_PATTERN], { dot: true })
        .pipe(gulp.dest('.tmp'));
});

/**
 * Processes all static files (i.e. images, fonts, stylesheets, scripts, etc) and deploys images, fonts and extra
 * files to the build directory. Styles and scripts remain in the temporary directory until the 'build' command is
 * invoked.
 */
gulp.task('static', ['images', 'videos', 'fonts', 'styles', 'scripts', 'extras'], function()
{
    return gulp.src(['.tmp/**/*.'+IMAGES_PATTERN, '.tmp/**/*.'+FONTS_PATTERN, '.tmp/**/*.'+EXTRAS_PATTERN])
        .pipe(gulp.dest('build'));
});

/**
 * Processes all template files (i.e. HTML, etc) and deploys them to the temporary directory.
 */
gulp.task('templates', function()
{
    return gulp.src(['app/**/*.'+TEMPLATES_PATTERN])
        .pipe($.fileInclude(
        {
            prefix: '@@',
            basepath: 'app/'
        }))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Injects Bower components into template files.
 */
gulp.task('wiredep', function()
{
    var wiredep = require('wiredep').stream;

    gulp.src('app/**/*.'+TEMPLATES_PATTERN)
        .pipe(wiredep({
            exclude: ['modernizr'],
            directory: 'bower_components',
            ignorePath: /^(\.\.\/)*\.\./
        }))
        .pipe(gulp.dest('app'));
});

/**
 * Cleans the build and temporary directories.
 */
gulp.task('clean', require('del').bind(null, ['.tmp', 'build']));

/**
 * Builds HTML templates. By default revision hash will be appended to the filename of stylesheets and scripts
 * and all HTML files will also be minified unless --debug is specified.
 */
gulp.task('build', ['static', 'templates'], function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var skipCSSO = $.util.env['skip-csso'] || debug;
    var skipUglify = $.util.env['skip-uglify'] || debug;
    var skipRev = $.util.env['skip-rev'] || debug;
    var skipMinifyHTML = $.util.env['skip-minify-html'] || debug;

    var assets = $.useref.assets({searchPath: ['.tmp', '.']});

    return gulp.src(['.tmp/**/*.'+TEMPLATES_PATTERN])
        .pipe(assets)
        .pipe($.if(!skipCSSO, $.if('*.css', $.csso())))
        .pipe($.if(!skipUglify, $.if('*.js', $.uglify()))).on('error', $.util.log)
        .pipe($.if(!skipRev, $.rev()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if(!skipRev, $.revReplace()))
        .pipe($.if(!skipMinifyHTML, $.if('*.html', $.minifyHtml({empty: true, conditionals: true, loose: true }))))
        .pipe(gulp.dest('build'))
        .pipe($.size({ title: 'build', gzip: true }));
});

/**
 * Serves project to localhost. If --debug is specified, files will be served from
 * the temporary directory (with loose files) instead of the build directory.
 */
gulp.task('serve', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var port = $.util.env['port'] || $.util.env['p'];
    var baseDir = (debug) ? '.tmp' : 'build';
    var browserSync = require('browser-sync');

    browserSync(
    {
        notify: false,
        port: (typeof port === 'number') ? port : 9000,
        server:
        {
            baseDir: [baseDir],
            routes:
            {
                '/bower_components': 'bower_components'
            }
        }
    });

    // Watch for changes.
    if (debug)
    {
        gulp.watch([
            baseDir+'/**/*.'+IMAGES_PATTERN,
            baseDir+'/**/*.'+STYLES_PATTERN,
            baseDir+'/**/*.'+SCRIPTS_PATTERN,
            baseDir+'/**/*.'+FONTS_PATTERN,
            baseDir+'/**/*.'+TEMPLATES_PATTERN
        ]).on('change', browserSync.reload);

        gulp.watch('app/**/*.'+IMAGES_PATTERN, ['images']);
        gulp.watch('app/**/*.'+STYLES_PATTERN, ['styles']);
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, ['scripts']);
        gulp.watch('app/**/*.'+FONTS_PATTERN, ['fonts']);
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, ['templates']);
        gulp.watch('bower.json', ['wiredep', 'fonts']);
    }
    else
    {
        gulp.watch('app/**/*.'+IMAGES_PATTERN, ['build', browserSync.reload]);
        gulp.watch('app/**/*.'+STYLES_PATTERN, ['build', browserSync.reload]);
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, ['build', browserSync.reload]);
        gulp.watch('app/**/*.'+FONTS_PATTERN, ['build', browserSync.reload]);
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, ['build', browserSync.reload]);
        gulp.watch('bower.json', ['build', browserSync.reload]);
    }
});

/**
 * Default task.
 */
gulp.task('default', function(callback)
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var serve = $.util.env['serve'] || $.util.env['s'];

    var seq = (debug) ? ['build'] : ['clean', 'build'];
    if (serve) seq.push('serve');
    seq.push(callback);

    sequence.apply(null, seq);
});
