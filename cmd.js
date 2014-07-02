#!/usr/bin/env node

var program = require('commander');
var http = require("http");
var fs = require("fs");
var qs = require('querystring');
var compile = require("./compile");

/////////////////////
// Parameters

var pkg = require("./package.json");

program
  .version(pkg.version)
  .description(pkg.description)
  .option("-i, --input [file]", "The input file (stdin is used if not provided)", function (path) { return fs.createReadStream(path); }, process.stdin)
  .option("-o, --output [file]", "The output file (stdout is used if not provided)", function (path) { return fs.createWriteStream(path); }, process.stdout)
  .option("-s, --server [port]", "Run a server mode of the minifier", function (port) { return parseInt(port, 10); })
  .parse(process.argv);

/////////////////////

if (program.server) {
  server();
}
else {
  cli();
}

function cli () {
  var glsl = '';
  program.input.resume();
  program.input.on('data', function(buf) { glsl += buf.toString(); });
  program.input.on('end', function() {
    var result = compile(glsl, "fragment");
    program.output.write(result);
  });
}

function server () {
  http
    .createServer(function (req, res) {
      console.log(req.method+" "+req.url);

      if (req.method=='GET' && req.url=='/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<html><body><h1>glsl-transition-minify</h1><p><pre><code>POST /compile\n\n{ "glsl": "__glsl__code__here__" }</code></pre></p></body></html>');
      }
      else if (req.method=='POST' && req.url === '/compile') {
        var body = '';
        req.setEncoding('utf8');
        req.on('data', function (data) {
          body += data.toString();
          // Too much POST data, kill the connection!
          if (body.length > 1e6)
              req.connection.destroy();
        });
        req.on('end', function () {
          try {
            var json = JSON.parse(body);
            if (!("glsl" in json)) throw new Error("No 'glsl' field in provided JSON.");
            var minified = compile(json.glsl, "fragment");
            console.log("Compiled GLSL: ("+json.glsl.length+" -> "+minified.length+" bytes)");
            res.writeHead(200, { 'Content-Type': 'application/json' });
            json.glsl = minified;
            res.end(JSON.stringify(json));
          }
          catch (e) {
            console.error(e.stack);
            res.writeHead(300);
            res.end(e.toString());
          }
        });
      }
      else {
        res.writeHead(404);
        res.end();
      }
    })
    .listen(program.server);
}
