var through = require('through');
var glslTokenizer = require('glsl-tokenizer');
var glslParser = require('glsl-parser');
var glslMin = require('glsl-min-stream');
var glslDeparser = require('glsl-deparser');

module.exports = function minify (input, onError) {
  if (!onError) {
    onError = function (e) {
      throw e;
    };
  }
  return input
    .pipe(glslTokenizer())
    .on('error', onError)
    .pipe(glslParser())
    .on('error', onError)
    .pipe(glslMin())
    .on('error', onError)
    .pipe(glslDeparser(false))
    .on('error', onError);
}
