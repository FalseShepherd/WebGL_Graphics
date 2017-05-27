/**
 * JSONModel  (ver. 1.0) - draw model loaded from a JSON file
 * 
 * The JSON file should define an object which has a data member named "faces",
 * which is an array of objects. Each object in the "faces" array should have
 * two data members, "vertexCoords" and "vertexColors". These data members are
 * each an array of vec3 elements, containing, respectively, the x, y, z
 * coordinates and RGB colors for each vertex.
 * 
 * We'll later add other model data (such as texture coordinates, shaders, etc.)
 * to this JSON model format.
 * 
 * @author Mike Goss (mikegoss@cs.du.edu)
 *
 */

"use strict";

/**
 * Constructor
 * 
 * @param gl - WebGL context
 * @param modelURL - string containing the URL of the model (usually relative
 *                   to the site root of the current HTML page)
 */
function JSONModel(gl, modelURL) {
  this.gl = gl;  // save reference to WebGL context

  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);

  // Load JSON file with model
  var model = LoadJSON(modelURL);
  if (model === null) return;  // if error (alert already displayed by LoadJSON)
  this.numFaces = model.faces.length;
  
  // Count vertices in each face.  Build a single array of vertices and
  // a single array of colors to send to buffer, and also build an
  // array with the number of vertices in each face. 
  this.faceVertexCount = [];
  var vertexCoords = [];
  var vertexColors = [];
  for (var i = 0; i < this.numFaces; ++i) {
    var face = model.faces[i];
    var numVertices = face.vertexCoords.length;
    if (face.vertexColors.length !== numVertices) {
      alert('ERROR: Badly formed face[' + i + '] in model "' + modelURL + '"');
      return;
    }
    this.faceVertexCount.push(numVertices);
    
    for (var j = 0; j < numVertices; ++j) {
      vertexCoords.push(face.vertexCoords[j]);
      vertexColors.push(face.vertexColors[j]);
    }
  }

  // Load vertex coordinates into WebGL buffer
  this.vertexCoordBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexCoords), gl.STATIC_DRAW );
  
  // Associate buffer with shader variable vPosition
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.enableVertexAttribArray(this.vPosition);

  // Load vertex colors into WebGL buffer
  this.vertexColorBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );
  
  // Associate buffer with shader variable vColor
  this.vColor = gl.getAttribLocation(this.shaderProgram, "vColor");
  gl.enableVertexAttribArray(this.vColor);
  
  // Get uniform variable location for transform matrix
  this.mTransform = gl.getUniformLocation(this.shaderProgram, "mTransform");
};

/**
 * Render - draw the scene on the canvas
 * 
 * @param matrixStack - transform model by matrix on top of stack
 *                     (may use stack to push transforms for any sub-models)
 */
JSONModel.prototype.Render = function(matrixStack) {
  var gl = this.gl;

  // Set transformation matrix for shader
  gl.useProgram(this.shaderProgram);
  gl.uniformMatrix4fv(this.mTransform, false, flatten(matrixStack.Top()));

  // Set buffers for this model's attributes
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer );
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer );
  gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 0, 0);

  // Draw each face as a triangle strip
  var start = 0;
  for (var face = 0; face < this.numFaces; ++face) {
    gl.drawArrays(gl.TRIANGLE_STRIP, start, this.faceVertexCount[face]);
    start += this.faceVertexCount[face];
  }
 };
