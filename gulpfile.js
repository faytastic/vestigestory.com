/* jshint -W069, -W079 */

/**
 *  vestigestory.com
 *  (c) Vestige <http://vestigestory.com>
 */

'use strict';
// generated on 2015-04-17 using generator-vars-webapp 0.1.7

// Patterns.
var IMAGES_PATTERN = '{jpg,jpeg,gif,png,svg,ico}';
var VIDEOS_PATTERN = '{ogv,mp4}';
var SCRIPTS_PATTERN = 'js';
var SOURCEMAPS_PATTERN = '{css.map,js.map}';
var STYLES_PATTERN = '{css,scss}';
var TEMPLATES_PATTERN = '{html,shtml,htm,html.erb,asp,php,md}';
var DATA_PATTERN = '{json,yml,csv}';
var FONTS_PATTERN = '{eot,svg,ttf,woff,woff2}';
var FILE_EXCLUDE_PATTERN = '{psd,ai}';

// Load modules.
var $ = require('gulp-load-plugins')();
var gulp = require('gulp');
var spawn = require('child_process').spawn;
var merge = require('merge-stream');
var sequence = require('run-sequence');

/**
 * Runs the Jekyll build task to generate all the templates. These files are generated to the
 * '.generated' directory.
 */
gulp.task('generate', function(callback)
{
    var proc = spawn('jekyll', ['build', '--destination=.generated'], { stdio: 'inherit' });

    proc.on('exit', function(code)
    {
        callback(code === 0 ? null : 'ERROR: \'generate\' task exited with code: ' + code);
    });
});

/**
 * Deploys images to the staging directory.
 * @param {Boolean} --debug         Specifies debug environment, skipping image compression.
 * @param {Boolean} --skip-imagemin Skips image compression.
 */
gulp.task('images', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipImageMin = $.util.env['skip-imagemin'] || $.util.env['si'] || debug;

    return gulp.src(['.generated/**/*'+IMAGES_PATTERN])
        .pipe($.if(!skipImageMin, $.cache($.imagemin({
            progressive: true,
            interlaced: true,
            svgoPlugins: [{cleanupIDs: false}]
        }))))
        .pipe(gulp.dest('.tmp'));
});

/**
 * Deploys videos to the staging directory.
 */
gulp.task('videos', function()
{
    return gulp.src(['.generated/**/*'+VIDEOS_PATTERN])
        .pipe(gulp.dest('.tmp'));
});

/**
 * Processes all CSS files if preprocessed CSS languages are used (i.e. Stylus, Sass). Deploys the processed
 * files to the staging directory.
 * @param {Boolean} --debug     Specifies debug environment, skipping CSS compression.
 * @param {Boolean} --skip-csso Skips CSS compression.
 */
gulp.task('styles', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipCSSO = $.util.env['skip-csso'] || $.util.env['sc'] || debug;

    return gulp.src('.generated/assets/css/*.'+STYLES_PATTERN)
        .pipe($.if(!debug, $.sourcemaps.init()))
        .pipe($.sass({
            outputStyle: 'nested',
            precision: 10,
            includePaths: ['.'],
            onError: console.error.bind(console, 'Sass error:')
        }))
        .pipe($.postcss([require('autoprefixer-core')({ browsers: ['last 2 version', 'ie 9'] })]))
        .pipe($.if(!skipCSSO, $.csso()))
        .pipe($.if(!debug, $.sourcemaps.write()))
        .pipe(gulp.dest('.tmp/assets/css'));
});

/**
 * Lints and processes all JavaScript files. If Browserify is included this task will bundle up all associated files. Processed
 * JavaScript files deployed to the staging directory.
 * @param {Boolean} --debug         Specifies debug environment, skipping JavaScript compression.
 * @param {Boolean} --skip-uglify   Skips JavaScript compression.
 */
gulp.task('scripts', function()
{
    var browserify = require('browserify');
    var reactify = require('reactify');
    var through = require('through2');

    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipUglify = $.util.env['skip-uglify'] || $.util.env['sj'] || debug;

    return merge
    (
        gulp.src(['.generated/assets/js/*.'+SCRIPTS_PATTERN])
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
            .pipe($.if(!debug, $.sourcemaps.init({ loadMaps: true })))
            .pipe($.if(!skipUglify, $.uglify())).on('error', $.util.log)
            .pipe($.if(!debug, $.sourcemaps.write('./')))
            .pipe(gulp.dest('.tmp/assets/js')),
        gulp.src(['.generated/assets/vendor/**/*.'+SCRIPTS_PATTERN])
            .pipe($.if(!skipUglify, $.uglify())).on('error', $.util.log)
            .pipe(gulp.dest('.tmp/assets/vendor'))
    );
});

/**
 * Processes all static files (i.e. images, stylesheets, scripts, etc) and deploys them to the staging directory.
 * The staged static files are then deployed to the production directory. Option to append revision hash to the end
 * of the associated file names.
 * @param {Boolean} --debug     Specifies debug environment for immediate and child tasks, skipping revisioning and
 *                              subsequent asset compressions.
 * @param {Boolean} --skip-rev  Skips revisioning.
 */
gulp.task('static', ['images', 'videos', 'styles', 'scripts'], function()
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipRev = $.util.env['skip-rev'] || $.util.env['sr'] || debug;

    return merge
    (
        gulp.src(['.tmp/assets/**/*.'+IMAGES_PATTERN, '.tmp/assets/**/*.'+VIDEOS_PATTERN, '.tmp/assets/**/*.'+STYLES_PATTERN, '.tmp/assets/**/*.'+SCRIPTS_PATTERN])
            .pipe($.if(!skipRev, $.rev()))
            .pipe(gulp.dest('public/assets'))
            .pipe($.size({ title: 'build', gzip: true }))
            .pipe($.if(!skipRev, $.rev.manifest()))
            .pipe(gulp.dest('.tmp')),
        gulp.src(['.tmp/*.'+IMAGES_PATTERN, '.tmp/**/*.'+SOURCEMAPS_PATTERN])
            .pipe(gulp.dest('public'))
    );
});

/**
 * Processes all template files (i.e. HTML) and deploys them to the staging and production directory.
 * @param {Boolean} --debug             Specifies debug environment, skipping HTML compression.
 * @param {Boolean} --skip-minify-html  Skips HTML compression.
 */
gulp.task('templates', function(callback)
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipMinifyHTML = $.util.env['skip-minify-html'] || $.util.env['sh'] || debug;

    return gulp.src(['.generated/**/*.'+TEMPLATES_PATTERN])
            .pipe($.if(!skipMinifyHTML, $.minifyHtml({empty: true, conditionals: true, loose: true })))
            .pipe(gulp.dest('.tmp'))
            .pipe(gulp.dest('public'));
});

/**
 * Builds the entire project from source directory -> staging directory -> production directory. This includes
 * generating the Jekyll templates, processing static and template files.
 * @param {Boolean} --debug     Specifies debug environment, skipping all sorts of static file compression.
 * @param {Boolean} --skip-rev  Skip replacing embedded file references with revision hash.
 */
gulp.task('build', ['templates', 'static'], function()
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var skipRev = $.util.env['skip-rev'] || $.util.env['sr'] || debug;

    if (!skipRev)
    {
        return gulp.src(['public/**/*.'+STYLES_PATTERN, 'public/**/*.'+SCRIPTS_PATTERN, 'public/**/*.'+TEMPLATES_PATTERN])
            .pipe($.revReplace({ manifest: gulp.src('.tmp/rev-manifest.json') }))
            .pipe(gulp.dest('public'));
    }
    else
    {
        return;
    }
});

/**
 * Cleans the generated, staging and production directories.
 */
gulp.task('clean', function(callback)
{
    require('del')(['.generated', '.tmp', 'public'], function()
    {
        $.cache.clearAll(callback);
    });
});

/**
 * Serves project to localhost.
 * @param {Boolean} --debug Serve files from the staging directory (loose files), defaults
 *                          to false (serve from production directory).
 * @param {Number}  --port  Optional port number (defaults to 9000).
 */
gulp.task('serve', function()
{
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var port = $.util.env['port'] || $.util.env['p'];
    var baseDir = (debug) ? '.tmp' : 'public';
    var browserSync = require('browser-sync');

    browserSync(
    {
        notify: false,
        port: (typeof port === 'number') ? port : 9000,
        server:
        {
            baseDir: [baseDir]
        }
    });

    // Watch for changes.
    if (debug)
    {
        gulp.watch('app/**/*.'+DATA_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
        gulp.watch('app/**/*.'+IMAGES_PATTERN, function() { sequence('generate', 'images', browserSync.reload); });
        gulp.watch('app/**/*.'+STYLES_PATTERN, function() { sequence('generate', 'styles', browserSync.reload); });
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, function() { sequence('generate', 'scripts', browserSync.reload); });
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, function() { sequence('generate', 'templates', browserSync.reload); });
    }
    else
    {
        gulp.watch('app/**/*.'+DATA_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
        gulp.watch('app/**/*.'+IMAGES_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
        gulp.watch('app/**/*.'+STYLES_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
        gulp.watch('app/**/*.'+SCRIPTS_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
        gulp.watch('app/**/*.'+TEMPLATES_PATTERN, function() { sequence('generate', 'build', browserSync.reload); });
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
    var debug = $.util.env['debug'] || $.util.env['d'] || process.env.GULP_CONFIG_DEBUG;
    var serve = $.util.env['serve'] || $.util.env['s'];

    var seq = ['clean', 'generate', 'build'];
    if (serve) seq.push('serve');
    seq.push(callback);

    sequence.apply(null, seq);
});
