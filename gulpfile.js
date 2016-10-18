/*
* @Author: wqx
* @Date:   2016-10-09 16:03:03
* @Last Modified by:   anchen
* @Last Modified time: 2016-10-18 14:24:05
*/

'use strict';
var gulp=require("gulp");
var browserSync=require("browser-sync").create();//静态服务器
var fileinClude=require("gulp-file-include");//文件包含
var imagemin=require("gulp-imagemin");//图片压缩
var minifyCss=require("gulp-minify-css");//css压缩
var sass=require("gulp-sass-china");//sass
var sourcemaps=require("gulp-sourcemaps");
var uglify=require("gulp-uglify");//js压缩
var gutil=require("gulp-util");//控制台
var watchPath=require("gulp-watch-path");//实时监控
var streamCombiner=require("stream-combiner2");
var autoprefixer=require("gulp-autoprefixer");//css自动填充

//控制台颜色
var handleError=function(err){
    var colors=gutil.colors;
    console.log('/n');
    gutil.log(colors.red('Error'));
    gutil.log('fileName:'+colors.red(err.fileName));
    gutil.log('lineNumber:'+colors.red(err.lineNumber));
    gutil.log('message:'+err.message);
    gutil.log('plugin:'+colors.yellow(err.plugin));
}
//静态服务器
gulp.task('server',function(){
    var files=[
        './dist/html/**/*',
        './dist/css/**/*',
        './dist/fonts/**/*',
        './dist/js/**/*',
        './dist/img/**/*'
    ];
    browserSync.init(files,{
        server:'./dist/'
    });
    var html=['dist/html/**/*'];
    gulp.watch(html).on('change',browserSync.reload);
})
//文件包含
gulp.task('fileinclude',function(){
    gulp.src(['src/html/**/*.html','!src/html/include/*.html'])
        .pipe(fileinClude({
            prefix:'@@',
            basepath:'@file'
            }))
        .pipe(gulp.dest('dist/html/'));
});
//监听css变化
gulp.task('watchcss', function () {
    gulp.watch('src/css/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
              browsers: 'last 2 versions',
              cascade:true,
              remove:true
            }))
            .pipe(minifyCss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
});
/*监听sass*/
gulp.task('watchsass',function(){
    gulp.watch('src/sass/*.scss',function(event){
        var paths=watchPath(event,'src','dist/');
        gutil.log(gutil.colors.green(event.type)+''+paths.srcPath);
        gutil.log('Dist '+paths.distPath);
        sass(paths.srcPath)
            .on('error',function(err){
                console.error('Error!',err.message);
                })
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
                browsers:'last 2 versions',
                cascade:true,
                remove:true
                }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
        })
});
//编译并压缩js
gulp.task("uglifyJs",function(){
    var combined=streamCombiner.obj([
        gulp.src('src/js/**/*'),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('./'),
        gulp.dest('dist/js/')
    ])
    combined.on('error',handleError);
});
//编译并压缩image
 gulp.task("image",function(){
    gulp.src('src/img/**/*')
        .pipe(imagemin({
            progressive:true
            }))
        .pipe(gulp.dest('dist/img/'))
})
//复制fonts等文件夹
gulp.task("copyFonts",function(){
    gulp.src("src/fonts/**/*")
        .pipe(gulp.dest("dist/fonts/"))
})

//实时监听
gulp.task("watch",function(){
    gulp.watch('src/js/**/*',['uglifyJs']);
    gulp.watch('src/images/**/*',['image']);
    gulp.watch('src/fonts/**/*',['copyFonts']);
    gulp.watch('dist/**/*.*').on('change', browserSync.reload);
})
gulp.task('default',['watchHtml','uglifyJs','image','copyFonts','watchsass','watchcss','server','fileinclude','indexFile','watch']);