#!/usr/bin/env node

var express = require('express');
var program = require('commander');
var http = require("http");
var fs = require("fs");
var qs = require('querystring');
var minify = require("./minify");

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

function compile (transition, cb) {
  var t = {};
  for (var k in transition) {
    if (transition.hasOwnProperty(k)) {
      t[k] = transition[k];
    }
  }
  t.glsl='';
  minify(transition.glsl).on('data', function (buf) {
    t.glsl += buf;
  }).on('end', function () {
    cb(null, t);
  }).once('error', function (err) {
    cb(err);
  }).resume();
}

function cli () {
  minify(program.input, function (e) { console.error(e.stack); process.exit(1); })
    .pipe(program.output);
}

function server () {
  var app = express();

  process.on('uncaughtException', function(err){
    console.error('uncaughtException: ' + err.message);
    console.error(err.stack);
  });

  app.get("/", function (req, res) {
    console.log("GET /");
    res
      .set({ 'Content-Type': 'text/html' })
      .send('<html><body><h1>glsl-transition-minify</h1><p><pre><code>POST /compile\n\n__glsl__code__in_the_body__</code></pre></p></body></html>');
  });

  app.post("/compile", function (req, res) {
    console.log("POST /compile – compiling...");
    function onError (e) {
      console.log("... compile failure: "+e.message);
      console.error(e.stack);
      res.status(400).send(e+"\n");
    }
    minify(req, onError)
      .on('end', function () {
        console.log("... compiled.");
      })
      .pipe(res);
  });

  app.listen(program.server);
}
