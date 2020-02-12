'use babel';
const fs = require('fs');

export default class Config{
  projectName:null
  allConfigKeys
  config
  
  constructor(projectPath) {
    let splited = projectPath[0].split("/");
    this.projectName = splited[splited.length-1];
    this.allConfigKeys = [
      "startWachOnStartup","lessPaths","compiledPaths","showNotifOnSuccess","generateSourceMap","minimaliseCss"
    ];    
    // this.getConfigJson();
  }
  
  getConfigFromFile(){
    const thc = this;
    let configFile,config,filePath=__dirname+`/config/${this.projectName}.conf`;
    
    if (!fs.existsSync(filePath)) {
      // configFile = this.getConfigJson();
      // fs.writeFile(filePath,configFile,err => {
      //   if (err) {
      //     console.warn(err);
      //   }
      // });
      atom.notifications.addWarning("Empty project config!",{
        description:`Config file for project '${this.projectName}' doesn't exists. Go to settings and create them.`
      });
      return false;
    }
    configFile = fs.readFileSync(filePath);
    config = JSON.parse(configFile.toString());
    this.replaceSettingAtom(config);
    return true;
  }
  
  replaceSettingAtom(conf) {
    const thc = this;
    for(let name in conf){
      const val = conf[name];
      atom.config.set(`watchless.${name}`,val);
    }
    // for(let name in conf){
    //   const val = conf[name];
    //   atom.config.onDidChange(`watchless.${name}`,obj=>{
    //     const {newValue,oldValue} = obj;
    //     if (newValue!==oldValue) {
    //       thc.updateConfig();
    //     }
    //   })
    // }
  }
  
  getConfigJson(){
    const thc = this;
    let arr={};
    for (var i in this.allConfigKeys){
      const key = this.allConfigKeys[i],
            curSett = atom.config.get(`watchless.${key}`);
      
      arr[key] = curSett;
    }
    
    return JSON.stringify(arr);
  }
  
  updateConfig(){
    const configFile = this.getConfigJson(),filePath=__dirname+`/config/${this.projectName}.conf`;
    fs.writeFile(filePath,configFile,err => {
      if (err) {
        console.warn(err);
      }
    });
  }
}
