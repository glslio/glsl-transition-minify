var glslTokenizer = require('glsl-tokenizer');
var glslParser = require('glsl-parser');
var glslMin = require('glsl-min-stream');
var glslDeparser = require('glsl-deparser');

// FIXME FIXME FIXME: since there is bugs in the minifier, we won't be minifying for now... FIXME FIXME FIXME
module.exports = function echo (input, onError) {
  if (!onError) {
    onError = function (e) {
      throw e;
    };
  }
  return input
    .on('error', onError)
    .pipe(glslTokenizer())
    .on('error', onError)
    .pipe(glslParser())
    .on('error', onError)
    .pipe(glslDeparser(false))
    .on('error', onError);
};

/*
module.exports = function minify (input, onError) {
  if (!onError) {
    onError = function (e) {
      throw e;
    };
  }
  return input
    .on('error', onError)
    .pipe(glslTokenizer())
    .on('error', onError)
    .pipe(glslParser())
    .on('error', onError)
    .pipe(glslMin())
    .on('error', onError)
    .pipe(glslDeparser(false))
    .on('error', onError);
}
*/
