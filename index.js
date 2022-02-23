const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require('child_process');

  if (require.main === module) {
        try {
            // `who-to-greet` input defined in action metadata file
            const result = {}
            const yaml_path = core.getInput('yaml-path');
            const isDir = core.getInput('is_dir');
            console.log(`Looking for yaml files!`)
            if(isDir === 'true'){
              var files_found = getyamlsfromdir(yaml_path);
              console.log(`Validating following yamls: ${files_found}`)
              files_found.forEach(function(yaml, index){
                  execute_command(yaml_path+'/'+yaml).then(function(res){
                    result = res
                  });
              })
              
            }
            else{
              console.log(`Validating the yaml from ${yaml_path}`)
              execute_command(yaml_path).then(function(res){
                result = res
              });
            }
            core.setOutput("result", result);
            // Get the JSON webhook payload for the event that triggered the workflow
            //const payload = JSON.stringify(github.context.payload, undefined, 2)
            //console.log(`The event payload: ${payload}`);
          } catch (error) {
            core.setFailed(error.message);
          }
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
    let result = {}
    exec(`oc process --local -f ${yaml} | kubeval --openshift`, (err, stdout, stderr) => {
        result = {
          err: err,
          stdout: stdout,
          stderr: stderr
        }
      });
      return result;
}
