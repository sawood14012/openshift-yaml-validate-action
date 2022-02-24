const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
var shell = require('shelljs');


  if (require.main === module) {
        try {
            // `who-to-greet` input defined in action metadata file
            const yaml_path = core.getInput('files');
            const kubernetes_mode = core.getInput('kubernetes_mode');
            console.log(`Looking for yaml files!`)
            if(yaml_path.endsWith('.yaml')){
              console.log(`Validating the yaml from ${yaml_path}`)
              execute_command(yaml_path, kubernetes_mode);
            }
            else{
              var files_found = getyamlsfromdir(yaml_path);
              console.log(`Validating following yamls: ${files_found}`)
              files_found.forEach(function(yaml, index){
                  execute_command(yaml_path+'/'+yaml, kubernetes_mode);
              })
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

async function execute_command(yaml, kubernetes_mode){
    let cmd = `oc process --local -f ${yaml} | kubeval --openshift --ignore-missing-schemas`
    if(kubernetes_mode === 'true'){
      cmd = `oc process --local -f ${yaml} | kubeval --ignore-missing-schemas`
    }
    const {code, stdout, stderr } = shell.exec(cmd)
    console.log(`process exited with exit code ${code}`)
    return {code, stdout, stderr }
}
