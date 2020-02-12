'use babel';
import Config from './config';

import { CompositeDisposable } from 'atom';

const gulp = require('gulp');
const less = require('gulp-less');
const gp_sourcemaps = require('gulp-sourcemaps');
const gp_cssmin = require('gulp-cssmin');
const fs = require('fs');

export default class Watchless{
    
  constructor(state) {    
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'watchless:startGulpWatch': () => this.startGulp(true),
      'watchless:generateAllLess': () => this.generateAllLess(),
      'watchless:updateConfig': () => this.config.updateConfig()
    }));
    // console.log("start");
    this.config = new Config(atom.project.getPaths());
    if (atom.config.get(`watchless.startWachOnStartup`)) {
      this.startGulp(true);
    }
  }
  
  generateAllLess(){
    this.startGulp();
  }
  getAllInDirectory(dir){
    return fs.readdirSync(dir);
  }
  startGulp(watch = false){
    if (!this.config.getConfigFromFile()) {
      return 0;
    }
    const lessPaths = atom.config.get("watchless.lessPaths"),
          stylesPaths = atom.config.get("watchless.compiledPaths"),
          rootDir = atom.project.getPaths();
    let arr=[],allLess=false,iteration=0;
    for (let i in lessPaths) {
      const path = lessPaths[i],pathSplit = path.split("/");
      if (path.indexOf("**")>-1) {
        arr[path] = stylesPaths[iteration];
        allLess = true;
      } else {
        for(var j in stylesPaths){
          const pathStyle = stylesPaths[j],pathStyleSplit = pathStyle.split("/");
          if (pathSplit[pathSplit.length-1] == pathStyleSplit[pathStyleSplit.length-1]) {
            arr[path] = pathStyle;
            break;
          }
        }
      }
      iteration++;
    }
    for(let less in arr){
      const thc = this;
      let style = arr[less];
      if (watch) {
        gulp.watch(`${rootDir}/${less}/*.less`).on("change",file => {
          const dirs = file.split("/"),
          name = dirs.pop();
          // cssFile = dirs.join("/").replace("less/",style);
          let cssFile=[];
          
          if (allLess) {
            for(let i in dirs){
              const dir = dirs[i];
              cssFile.push(dir);
              if (dir===this.config.projectName) {
                cssFile=cssFile.concat(style.split("/"));
                break;
              }
            }
            cssFile.push(dirs[dirs.length-1]);
            cssFile = cssFile.join("/");
            thc.lessOneFile(file,cssFile,name);
          } else {
            thc.lessOneFile(file,`${rootDir}/${style}`,name);
          }
        });
      } else {
        let lessDir = less;
        if (allLess) {
          lessDir = less.replace("**","");
        }
        let mainDir = `${rootDir}/${lessDir}`;
        
        const allInDir = this.getAllInDirectory(mainDir);
        if (style[style.length-1]!=="/") {
          style += "/";
        }
        for (let lessDir of allInDir) {
          this.lessOneFile(`${mainDir}${lessDir}/*.less`,`${rootDir}/${style}${lessDir}`,`generateAll: ${lessDir}`);
        }
      }
    }
  }
  lessOneFile (src,destDir,name) {
  	console.log("compiled: "+name+"!");
  	console.log("/////////////////////////////////");
    const showNotifOnSuccess = atom.config.get("watchless.showNotifOnSuccess"),
          generateSourceMap = atom.config.get("watchless.generateSourceMap"),
          minimaliseCss = atom.config.get("watchless.minimaliseCss");
          
    
    let gulpFun = `gulp.src(src)`;
    gulpFun += `.pipe(less())`;
    gulpFun += `.on("error",onError)`;
    if (minimaliseCss) {
      gulpFun += `.pipe(gp_cssmin())`;
    }
    
    if (generateSourceMap) {
      gulpFun += `.pipe(gp_sourcemaps.init())`;
      gulpFun += `.pipe(gp_sourcemaps.write("./"))`;
    }
    gulpFun += `.pipe(gulp.dest(destDir))`;
    gulpFun += `.on("end",onReady)`;
    
    function onError(err){
      let messTitle = `Error compiled file!`;
      let mess = `File: ${err.fileName}
      `;
      mess += `Line number: ${err.lineNumber} 
      `;
      mess += `Message: ${err.message}
      `;
      atom.notifications.addError(messTitle,{
        description:err.fileName,
        detail:mess
      });
    }
    function onReady(arr) {
      if (showNotifOnSuccess) {
        atom.notifications.addSuccess("Success compiled: "+name);
      }
    }
    
    return eval(gulpFun);
  }
};
