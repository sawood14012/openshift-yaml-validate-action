const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
const { spawn } = require('child_process');


  if (require.main === module) {
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
              execute_command(yaml_path);
            }
            
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

async function execute_command(yaml){
  const child = spawn(`oc process --local -f ${yaml} | kubeval --openshift`);
  child.stdout.on('data', (chunk) => {
    // data from standard output is here as buffers
    console.log(chunk)
  });
  
  // since these are streams, you can pipe them elsewhere
  child.stderr.on('error', (err)=> {
    console.log(err.message)
  })
  
  child.on('close', (code) => {
    console.log(`process exited with code ${code}`);
    core.setOutput("result", code)
  });
    //const { stdout, stderr } = await exec(`oc process --local -f ${yaml} | kubeval --openshift`);
    ////const result = {
    //  stdout: stdout,
    //  stderr: stderr
   // }
   // return result; 
}
