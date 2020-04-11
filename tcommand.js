var { spawn } = require('child_process');
let comp = "&";

var tcommand = spawn('tersect', ['view','/Users/cranfieldbix/tomato.tsi', '"\'S.hab CGN15792\'' + comp + 'u(* - \'S.hab CGN15792\')"', "|", "head"], {shell:true});

tcommand.stdout.on('data', (data) =>{
    console.log(data.toString());
});
tcommand.stderr.on('data', (data) => {
    console.error(`grep stderr: ${data}`);
  });
  
 tcommand.on('close', (code) => {
    if (code !== 0) {
      console.log(`grep process exited with code ${code}`);
    }
  });