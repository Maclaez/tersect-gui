const express = require('express');
const app = express();
// const bodyParser = require('body-parser');
// var urlencodedParser = bodyParser.urlencoded({ extended: false });
var urlencodedParser = express.urlencoded({ extended: false });
const fs = require('fs');
// var { spawn } = require('child_process');
var spawn = require('child_process').spawn;

const port = 3000;
const path_to_project = ""; //add path to project directory
app.use(express.static(path_to_project));

app.listen(port,'0.0.0.0', function () {
  console.log('Application deployed');
})


//add file path to tsi file to run
function tersect(comp, file, sA, sB, rev) {
  //need to look into JSON object strings - for now use .includes()
  console.log(comp);
  //if command involves B going first
  if (rev.includes("yes")) {
    //if command is for single circle/fileset
    if (comp.includes("none")) {
      var tcommand = spawn('tersect', ['view', 'tomato.tsi', '"' + sB + '"'], { shell: true });
      //if command is for difference betweeen B and A
    } else {
      var tcommand = spawn('tersect', ['view', 'tomato.tsi', '"' + sB + comp + sA + '"'], { shell: true });

    }

  } else {
    //if intersect
    if (comp.includes("amp")) {
      var tcommand = spawn('tersect', ['view', 'tomato.tsi', '"' + sA + '&' + sB + '"'], { shell: true });

      //if command is for single circle/fileset
    } else if (comp.includes("none")) {
      var tcommand = spawn('tersect', ['view', 'tomato.tsi', '"' + sA + '"'], { shell: true });
      //if command is for difference betweeen A and B
    } else {
      var tcommand = spawn('tersect', ['view', 'tomato.tsi', '"' + sA + comp + sB + '"'], { shell: true });

    }

  }
  let output = fs.createWriteStream(file);
  tcommand.stdout.on('data', (data) => {
    output.write(data);
  });


  tcommand.stderr.on('data', (data) => {
    console.error(`tersect stderr: ${data}`);
  });

  tcommand.on('close', (code) => {
    if (code !== 0) {
      console.log(`tersect process exited with code ${code}`);
    } else {
      console.log('done!');
    }
  });
}



app.post('/', urlencodedParser, function (req, res) {
  //if post is for end results
  if (req.body.operation) {

    var opt = req.body.operation;
    var f = req.body.filepath;
    var r = req.body.reverse;
    //convert samples selected into tersect format u()
    var A = "u" + req.body.setA.toString().replace(/\[/g, "(").replace(/\]/g, ")").replace(/"/g, "");
    var B = "u" + req.body.setB.toString().replace(/\[/g, "(").replace(/\]/g, ")").replace(/"/g, "");

    tersect(opt, f, A, B, r);
    res.send({ "location": f });

    //if post is for populating samples table
  } else if (req.body.tsifile) {

    var arr = [];

    var getSamples = spawn('tersect', ['samples', req.body.tsifile], { shell: true });

    //The output of the command is printed in the command line if there are no errors
    getSamples.stdout.on('data', (data) => {
      //each sample name is on a new line, split by new line
      arr = data.toString().trim().split('\n');
      //remove first item - Sample
      arr.shift();
      res.send({ "samples": arr });
    });

    //prints error from running tersect
    getSamples.stderr.on('data', (data) => {
      console.error(`tersect stderr: ${data}`);
    });

    //prints after command is complete if there was an error
    getSamples.on('close', (code) => {
      if (code !== 0) {
        console.log(`tersect process exited with code ${code}`);
      }

    });

  }




})
