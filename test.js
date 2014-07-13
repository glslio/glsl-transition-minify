var through = require("through");
var minify = require("./minify");
var assert = require("assert");

function minifySync (source) {
  var strm = through();
  var res = "";
  minify(strm).on("data", function (glsl) { res += glsl; });
  strm.write(source);
  strm.end();
  return res;
}

describe("minify", function () {
  var glsl1 = "void main () { float abcdef = 1.000; }";
  var expect1 = "void main(){float a=1.000;}";
  
  it("should minify simple GLSL code", function () {
    assert.equal(minifySync(glsl1), expect1);
  });

  it("should refuse invalid glsl", function () {
    assert.throws(function () {
      console.log(minifySync("void main () { float a = 10.0"));
    });
    assert.throws(function () {
      console.log(minifySync("void main () { float a = 10.0 }"));
    });
  });
  it("should preserve the uniforms", function () {
    var minified = minifySync("uniform vec2 foobar; void main () { float abcdef = 1.000; }");
    assert.notEqual(minified.indexOf("foobar"), -1, "foobar is still present.");
  });
  it("should not collide when using uniforms called 'a' or 'b'", function () {
    var minified = minifySync("uniform vec2 a; uniform vec2 foobar; uniform vec2 b; void main () { int foo = 42; int i = 42; }");
    assert.equal(minified.indexOf("int a"), -1, "There was no rename of int variable");
    assert.equal(minified.indexOf("int b"), -1, "There was no rename of int variable");
  });
});
