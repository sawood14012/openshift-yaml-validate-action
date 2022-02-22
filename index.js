const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');


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


try {
  // `who-to-greet` input defined in action metadata file
  const yaml_path = core.getInput('yaml-path');
  const isDir = core.getInput('is_dir');
  console.log(`Looking for yaml files!`)
  if(isDir === 'true'){
    var files_found = getyamlsfromdir(yaml_path);
    console.log(`Validating following yamls: ${files_found}`)
    exec('oc', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }
      
        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
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