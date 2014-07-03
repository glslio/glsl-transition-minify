var glslunit = require("./basic_glsl_compiler");

function compile (source, name) {
  var o = {};
  o[name] = source;
  var shaderProgram = glslunit.compiler.Preprocessor.ParseFile(name, o);
  var compiler = new glslunit.compiler.Compiler(shaderProgram);
  
  var shouldRenameNode_ = glslunit.compiler.VariableMinifier.prototype.shouldRenameNode_;
  glslunit.compiler.VariableMinifier.prototype.shouldRenameNode_ = function (declaratorNode) {
    var name = declaratorNode.declarators[0].name.name;
    return name!="texCoord" && shouldRenameNode_.apply(this, arguments);
  }
  var variableMinifier = new glslunit.compiler.VariableMinifier();

  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.DeadFunctionRemover());
  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.BraceReducer());
  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, variableMinifier);
  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.DeclarationConsolidation());
  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.FunctionMinifier());
  compiler.registerStep(glslunit.compiler.Compiler.CompilerPhase.MINIFICATION, new glslunit.compiler.ConstructorMinifier());
  shaderProgram = compiler.compileProgram();
  var output = glslunit.Generator.getSourceCode(shaderProgram.vertexAst, '\n');
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
