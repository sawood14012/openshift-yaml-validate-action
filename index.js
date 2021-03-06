const fs = require('fs');
const core = require('@actions/core');
const github = require('@actions/github');
var shell = require('shelljs');
const { GitHub } = require('@actions/github/lib/utils');


  if (require.main === module) {
        try {
            // `who-to-greet` input defined in action metadata file
            const yaml_path = core.getInput('files');
            const kubernetes_mode = core.getInput('kubernetes_mode');
            const schemaurl = core.getInput('schema_url');
            const github_token = core.getInput('GITHUB_TOKEN');
            const context = github.context;
            // const non_template = core.getInput('non_template');
            
            console.log(`Looking for yaml files!`)
            if(yaml_path.endsWith('.yaml')){
              console.log(`Validating the yaml from ${yaml_path}`)
              execute_command(yaml_path, kubernetes_mode, schemaurl, context, github_token);
            }
            else{
              var files_found = getyamlsfromdir(yaml_path);
              console.log(`Validating following yamls: ${files_found}`)
              files_found.forEach(function(yaml, index){
                  execute_command(yaml_path+'/'+yaml, kubernetes_mode, schemaurl, context, github_token);
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

async function execute_process(yaml){
  let template_fig = `oc process --local -f ${yaml}`
  let {code, stdout, stderr } = await shell.exec(template_fig, {silent: true})
  if(stderr.includes('error') || stderr.includes('ERR') || stderr.includes('ERROR') || stderr.includes('Error')){
    return false;
  } else if(stdout.includes('error') ||stdout.includes('ERR') || stdout.includes('ERROR') || stdout.includes('Error')){
    return false;
  }
  return true;
  
}


async function execute_command(yaml, kubernetes_mode, schemaurl, context, github_token){
   
    let cmd = `oc process --local -f ${yaml} | kubeval --openshift --ignore-missing-schemas`
    let is_template = await execute_process(yaml);
    if(is_template){
      if(kubernetes_mode === 'true'){
        cmd = `kubeval ${yaml}  --openshift --ignore-missing-schemas`
      }
      else{
        cmd = `oc process --local -f ${yaml} | kubeval --ignore-missing-schemas`
      }
    }
    else{
      cmd = `kubeval ${yaml} --ignore-missing-schemas`
    }
    if(schemaurl !== ''){
      let arg = ` --schema-location ${schemaurl}`
      cmd = cmd + arg;
    }
    let {code, stdout, stderr } = await shell.exec(cmd)
    if(stderr.includes('error') || stderr.includes('ERR') || stderr.includes('ERROR') || stderr.includes('Error')){
      shell.echo(stderr);
      code = 1;
      shell.exit(code);
    } else if(stdout.includes('error') ||stdout.includes('ERR') || stdout.includes('ERROR') || stdout.includes('Error')){
      shell.echo(stderr);
      code = 1;
      shell.exit(code);
    }
    else{
      code = 0;
    }
    console.log(`process exited with exit code ${code}`)
    // await pull_reqComment(context, stdout, github_token);
    return {code, stdout, stderr }
}

async function pull_reqComment(context, data, github_token){
    if (context.payload.pull_request == null) {
        return;
    }
    else{
      if(github_token === ''){
        core.setFailed('Cannot Comment on Pull Request without a github token please Provide one!');
      }
      const pull_request_number = context.payload.pull_request.number;
      const octokit = github.getOctokit(github_token);
      octokit.rest.issues.createComment({
          ...context.repo,
          issue_number: pull_request_number,
          body: data
        });
    }
}
