const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const tc = require('@actions/tool-cache');
const { exec } = require('child_process');

async function setup() {
    // Get version of tool to be installed
  
    // Download the specific version of the tool, e.g. as a tarball
    const pathToTarball = await tc.downloadTool(`https://github.com/instrumenta/kubeval/releases/latest/download/kubeval-linux-amd64.tar.gz`);
  
    // Extract the tarball onto the runner
    const pathToCLI = await tc.extractTar(pathToTarball);
  
    // Expose the tool by adding it to the PATH
    core.addPath(pathToCLI)
    
}

module.exports = setup

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
        exec(`setup-kubeval blueprint.yaml`, (err, stdout, stderr) => {
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


try {
  // `who-to-greet` input defined in action metadata file
  setup()
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