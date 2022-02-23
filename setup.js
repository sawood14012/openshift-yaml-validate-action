const utils = require('./utils');
const path = require('path');
const tc = require('@actions/tool-cache');
const { exec } = require('child_process');
const util = require('util');
const exec1 = util.promisify(require('child_process').exec);

async function down(url) {
    const { stdout, stderr } = await exec1(`wget ${url}`);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
  }
async function setup() {
    try {
      // Get version of tool to be installed
      // const version = core.getInput('version');
  
      // Download the specific version of the tool, e.g. as a tarball/zipball
      //const download = utils.getDownloadObject();
      //const pathToTarball = await tc.downloadTool(download.url);
  
      // Extract the tarball/zipball onto host runner
      //const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
      //const pathToCLI = await extract(pathToTarball);
  
      // Expose the tool by adding it to the PATH
      //core.addPath(path.join(pathToCLI, download.binPath));
      //console.log(path.join(pathToCLI, download.binPath));
      //const extract = download.url.endsWith('.zip') ? '7z x' : 'tar -xzf';
      /* const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
      exec(`wget ${download.url}`, (err, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        }).on(function(){
            extract(path.join(download.fullname)).then(function(pathToCLI){
                console.log(pathToCLI);
            });
        }) */
        const download = utils.getDownloadObject();
        const extract = download.url.endsWith('.zip') ? tc.extractZip : tc.extractTar;
        down(download.url).then(function(){
            extract(path.join(download.fullname)).then(function(pathToCLI){
                console.log(pathToCLI);
            });
        })
        
    } catch (e) {
      core.setFailed(e);
    }
  }

  if (require.main === module) {
      setup();
  }
module.exports = setup