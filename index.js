const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');


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
  const yaml_dir = core.getInput('yaml-dir');
  console.log(`Looking for yaml files!`)
  if(yaml_dir !== ''){
    var files_found = getyamlsfromdir(yaml_dir);

    console.log(`Validating following yamls: ${files_found}`)
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