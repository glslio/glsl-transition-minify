var through = require('through');
var glslTokenizer = require('glsl-tokenizer');
var glslParser = require('glsl-parser');

var glslunit = require("./basic_glsl_compiler");

function compile (source, name) {
  var output;
  var strm = through();
  
  // The first part is ensuring the code is understood by Tokenizer and Parser
  strm.pipe(glslTokenizer()).pipe(glslParser()).on('data', function(x) {
    // Now we use glslunit since there is no minifier yet ?!
    var o = {};
    o[name] = source;
    var shaderProgram = glslunit.compiler.Preprocessor.ParseFile(name, o);
    var compiler = new glslunit.compiler.Compiler(shaderProgram);

    compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.DeadFunctionRemover());
    compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.BraceReducer());
    // compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.VariableMinifier());
    // ^ currently there is a bug in the VariableMinifier, it have collision if there is already 'a' uniforms
    compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.DeclarationConsolidation());
    compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.FunctionMinifier());
    compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.ConstructorMinifier());
    shaderProgram = compiler.compileProgram();
    output = glslunit.Generator.getSourceCode(shaderProgram.vertexAst, '\n');
  });

  strm.write(source);

  return output;
}

function minify (transition) {
  var t = {};
  for (var k in transition) {
    if (transition.hasOwnProperty(k)) {
      t[k] = transition[k];
    }
  }
  t.glsl = compile(t.glsl, t.name||"fragment");
  return t;
}

module.exports = minify;
