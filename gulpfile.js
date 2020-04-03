var gulp = require('gulp');

// 引入组件
var path          = require('path'), // node自带组件
    fse          = require('fs-extra'), // 通过npm下载
    fs = require('fs');
    less          = require('gulp-less'),
    autoprefixer  = require('gulp-autoprefixer'),
    merge         = require('merge-stream'),
    concat        = require('gulp-concat'),
    clean         = require('gulp-clean');
    pump    = require('pump');
runSequence = require('run-sequence')

// 获取当前文件路径
var PWD = process.env.PWD || process.cwd(); // 兼容windows
//===================
//   autoprefixer
//===================
var filelist = []
function findAllFiles(filePath){
    //根据文件路径读取文件，返回文件列表
    var readDir = fs.readdirSync(filePath);
    readDir.forEach(function(filename){
        //获取当前文件的绝对路径
        var filedir = path.join(filePath,filename);
        //根据文件路径获取文件信息，返回一个fs.Stats对象
        var stats = fs.statSync(filedir);
        var isFile = stats.isFile();//是文件
        var isDir = stats.isDirectory();//是文件夹
        if(isFile){
            filelist.push(filedir);
          }
         if(isDir){
             findAllFiles(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                }
        })

}
gulp.task('clean', function(cb) {
    pump([
        gulp.src('./dist'),
        clean()
    ], cb)
})
gulp.task('autoprefixer', function () {
    return gulp.src('./css/*.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true,
            remove:true
        }))
        .pipe(gulp.dest('dist/css'));
});
//=======================
//     服务器 + 监听
//=======================
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
gulp.task('less',function(){
    gulp.src('less/*.less')   //获取所有less文件路径
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: true,
            remove:true
        })) 　　　　　　　   //执行less
        .pipe(gulp.dest('./css')) ;  //输出CSS文件路径
});
gulp.task('default', function() {
    // 监听重载文件
    var files = [
        '*.html',
        'css/*.css',
        'js/*.js'
    ]
    browserSync.init(files, {
        server: {
            baseDir: "./",
            directory: true
        },
        open: 'external',
        startPath: "./index.html"
    });
    // 监听编译文件
    gulp.watch("less/*.less",['less']).on('change',function () {

    });
    gulp.watch("*.html").on('change', browserSync.reload);
    gulp.watch("css/*.css").on('change', browserSync.reload);
    gulp.watch("js/*.js").on('change', browserSync.reload);
});
gulp.task('copy',function(){
    var filepath = ['./js','./img','./font']
    var otherlist = ['./*.html','./css/*.css']
    filelist = []
    for(var key in filepath){
        findAllFiles(filepath[key])
    }
    console.log(filelist)
    return gulp
        .src(filelist.concat(otherlist),{base:"."})
        .pipe(gulp.dest('dist'));
});
gulp.task('build', runSequence('less','autoprefixer','clean','copy'),function () {

});
