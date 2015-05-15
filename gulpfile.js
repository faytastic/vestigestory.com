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
var SOURCEMAPS_PATTERN = '{css.map,js.map}';
var STYLES_PATTERN = '{css,scss}';
var TEMPLATES_PATTERN = '{html,shtml,htm,html.erb,asp,php}';
var EXTRAS_PATTERN = '{txt,htaccess}';
var FONTS_PATTERN = '{eot,svg,ttf,woff,woff2}';
var FILE_EXCLUDE_PATTERN = '{psd,ai}';

// Load modules.
var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var sequence = require('run-sequence');

/**
 * Deploys images to the staging directory.
 * @param {Boolean} --debug         Specifies debug environment, skipping image compression.
 * @param {Boolean} --skip-imagemin Skips image compression.
 */
gulp.task('images', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var skipImageMin = $.util.env['skip-imagemin'] || debug;

    return gulp.src(['app/_assets/**/*'+IMAGES_PATTERN])
        .pipe($.if(!skipImageMin, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{cleanupIDs: false}]
        }))))
        .pipe(gulp.dest('.tmp/assets'));
});

/**
 * Deploys videos to the staging directory.
 */
gulp.task('videos', function()
{
    return gulp.src(['app/_assets/**/*'+VIDEOS_PATTERN])
        .pipe(gulp.dest('.tmp/assets'));
});

/**
 * Deploys all fonts from Bower components to the staging directory.
 */
gulp.task('fonts', function()
{
    return gulp.src(require('main-bower-files')({ filter: '**/*.'+FONTS_PATTERN }).concat('app/_assets/fonts/**/*'))
        .pipe(gulp.dest('.tmp/assets/fonts'));
});

/**
 * Processes all CSS files if preprocessed CSS languages are used (i.e. Stylus, Sass). Deploys the processed
 * files to the staging directory.
 */
gulp.task('styles', function()
{
    return gulp.src('app/_assets/**/*.'+STYLES_PATTERN)
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.postcss([require('autoprefixer-core')({ browsers: ['last 2 version', 'ie 9'] })]))
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest('.tmp/assets'));
});

/**
 * Lints and processes all JavaScript files. If Browserify is included this task will bundle up all associated files. Processed
 * JavaScript files deployed to the staging directory.
 */
gulp.task('scripts', function()
{
    var browserify = require('browserify');
    var reactify = require('reactify');
    var through = require('through2');

    return gulp.src(['./app/_assets/js/*.'+SCRIPTS_PATTERN])
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
        .pipe(gulp.dest('.tmp/assets/js'));
});

/**
 * Processes all static files (i.e. images, fonts, stylesheets, scripts, etc) and deploys them to the staging directory.
 * The staged static files are then deployed to the production directory.
 */
gulp.task('static', ['images', 'videos', 'fonts', 'styles', 'scripts']);

/**
 * Runs the Jekyll build task to generate all the templates.
 */
gulp.task('templates', function()
{
    spawn('jekyll', ['build', '--destination=.tmp'], { stdio: 'inherit' });
});

/**
 * Builds the entire project from source directory -> staging directory -> production directory. This includes
 * processing static files and generating Jekyll templates.
 * @param {Boolean} --debug             Specifies debug environment, skipping all sorts of static file compression.
 * @param {Boolean} --skip-csso         Skip CSS minification.
 * @param {Boolean} --skip-uglify       Skip JavaScript uglification.
 * @param {Boolean} --skip-rev          Skip appending revision hash to static filenames.
 * @param {Boolean} --skip-minify-html  Skip HTML minification.
 */
gulp.task('build', ['templates', 'static'], function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var skipCSSO = $.util.env['skip-csso'] || debug;
    var skipUglify = $.util.env['skip-uglify'] || debug;
    var skipRev = $.util.env['skip-rev'] || debug;
    var skipMinifyHTML = $.util.env['skip-minify-html'] || debug;

    var assets = $.useref.assets({searchPath: ['.tmp', '.']});

    return $.merge
    (
        gulp.src(['.tmp/**/*.'+TEMPLATES_PATTERN])
            .pipe(assets)
            .pipe($.if(!skipCSSO, $.if('*.css', $.csso())))
            .pipe($.if(!skipUglify, $.if('*.js', $.uglify()))).on('error', $.util.log)
            .pipe($.if(!skipRev, $.rev()))
            .pipe(assets.restore())
            .pipe($.useref())
            .pipe($.if(!skipRev, $.revReplace()))
            .pipe($.if(!skipMinifyHTML, $.if('*.html', $.minifyHtml({empty: true, conditionals: true, loose: true }))))
            .pipe(gulp.dest('public'))
            .pipe($.size({ title: 'templates', gzip: true })),
        gulp.src(['.tmp/**/*', '!.tmp/**/*.'+TEMPLATES_PATTERN, '!.tmp/**/*.'+STYLES_PATTERN, '!.tmp/**/*.'+SCRIPTS_PATTERN])
            .pipe(gulp.dest('public'))
            .pipe($.size({ title: 'static', gzip: true }))
    );
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
gulp.task('clean', function(callback)
{
    require('del')(['.tmp', 'public'], function()
    {
        $.cache.clearAll(callback);
    });
});

/**
 * Serves project to localhost.
 * @param {Boolean} --debug Serve files from the staging directory (loose files), defaults
 *                          to false (serve from production directory).
 */
gulp.task('serve', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var port = $.util.env['port'] || $.util.env['p'];
    var baseDir = (debug) ? '.tmp' : 'public';
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
 * @param {Boolean} --debug Specifies debug environment, meaning all sub-tasks will be
 *                          iterated in this environment.
 * @param {Boolean} --serve Specifies whether the site should be served at the end of
 *                          this task.
 */
gulp.task('default', function(callback)
{
    var debug = $.util.env['debug'] || $.util.env['d'];
    var serve = $.util.env['serve'] || $.util.env['s'];

    var seq = ['clean', 'build'];
    if (serve) seq.push('serve');
    seq.push(callback);

    sequence.apply(null, seq);
});
