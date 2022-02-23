const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const utils = require('./utils');
const path = require('path');
const { exec } = require('child_process');

async function setup() {
    try {
      // Get version of tool to be installed
      // const version = core.getInput('version');
  
      // Download the specific version of the tool, e.g. as a tarball/zipball
      const download = utils.getDownloadObject();
      //const pathToTarball = await tc.downloadTool(download.url);
  
      // Extract the tarball/zipball onto host runner
      //const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
      //const pathToCLI = await extract(pathToTarball);
  
      // Expose the tool by adding it to the PATH
      //core.addPath(path.join(pathToCLI, download.binPath));
      //console.log(path.join(pathToCLI, download.binPath));
      const extract = download.url.endsWith('.zip') ? '7z x' : 'tar -xzf';
      exec(`wget ${download.url} && ${extract} ${download.fullname}`, (err, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        })
    } catch (e) {
      core.setFailed(e);
    }
  }
  
  module.exports = setup
  
  if (require.main === module) {
    setup().then(function(){
        try {
            // `who-to-greet` input defined in action metadata file
            const yaml_path = core.getInput('yaml-path');
            const isDir = core.getInput('is_dir');
            console.log(`Looking for yaml files!`)
            if(isDir === 'true'){
              var files_found = getyamlsfromdir(yaml_path);
              console.log(`Validating following yamls: ${files_found}`)
              files_found.forEach(function(yaml, index){
                  execute_command(yaml_path+'/'+yaml);
              })
              
            }
            else{
              console.log(`Validating the yaml from ${yaml_path}`)
            }
            const time = (new Date()).toTimeString();
            core.setOutput("time", time);
            // Get the JSON webhook payload for the event that triggered the workflow
            const payload = JSON.stringify(github.context.payload, undefined, 2)
            console.log(`The event payload: ${payload}`);
          } catch (error) {
            core.setFailed(error.message);
          }
    });
  }

function getyamlsfromdir(dir){
    try{
    var files = fs.readdirSync(dir).filter(fn => fn.endsWith('.yaml'));
    if(files.length < 1){
        console.log(`Looks like an empty Directory!`)
        throw 'Empty dir error'
    }
    return files
    } catch(err){
        core.setFailed('Please provide an Directory with files');
    }
}

function execute_command(yaml){
    exec(`oc process --local -f ${yaml} -o yaml > blueprint.yaml`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          throw err;
        }
        exec(`ls -l`, (err, stdout, stderr) => {
            if (err) {
                // node couldn't execute the command
                throw err;
              }
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
        });
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
}
