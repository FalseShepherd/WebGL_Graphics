/**
 * Lab 3 - COMP3801 Winter 2017
 *   ColorCube - draw a cube with six different color faces
 * 
 * @author Mike Goss (mikegoss@cs.du.edu)
 */

"use strict";

/**
 * Constructor
 * 
 * @param canvasID - string containing name of canvas to render.
 */
function ColorCube(canvasID) {
  var t = this;  // save reference to this object for callbacks
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
  
  this.coords = ["x","y","z"];
  var xyzSliders = [];
  var xyzScalers = [];
  var xyzSliderValues = [];
  var xyzScalerValues = [];
  var isPaused = false;
  
  //Play/Pause button
  
  var playPausebtn = document.getElementById(this.canvasID + "-playpause-button");
  if(playPausebtn == null) {
      alert("Play/Pause button not found");
      return;
  }
  
  playPausebtn.addEventListener("click", function() {
      if(isPaused == false) {
          playPausebtn.innerHTML = "Play";
          isPaused = true;
      } else {
          playPausebtn.innerHTML = "Pause";
          isPaused = false;
      }
  })
  
  
//  //Slider initialization stuffs
  for (var i in this.coords) {
    var coord = this.coords[i];
    var sliderID = this.canvasID + "-" + coord + "-slider";
    var scalerID = this.canvasID + "-" + coord + "-scaler";
    xyzSliders[coord] = document.getElementById(sliderID);
    xyzScalers[coord] = document.getElementById(scalerID);
    if (xyzSliders[coord] === null) {
      alert("Slider ID not found: " + sliderID);
      return;
    }
    var valueID = this.canvasID + "-" + coord + "-value";
    var scalerValue = this.canvasID + "-" + coord + "-scale";
    xyzScalerValues[scalerValue] = document.getElementById(scalerValue);
    xyzSliderValues[coord] = document.getElementById(valueID);
    if (xyzSliders[coord] === null) {
      alert("Slider value ID not found: " + sliderID);
      return;
    }
    xyzSliders[coord].valueDisplay = xyzSliderValues[coord];  // attach to slider
    xyzScalers[coord].valueDisplay = xyzScalerValues[coord];
    // Callback for change of slider value
    var sliderCallback = function (e) {
      // Update text display for slider
      var scoordS = e.target.value;
      e.target.valueDisplay.textContent = scoordS;
      console.log("Coord from slider: " + scoordS);

      // Re-render canvas
      requestAnimationFrame(render);
    };
    //var xSliderCallback
    // The "input" and "change" events work differently on IE from Chrome and
    // Firefox. We set up both types of events.
    xyzSliders[coord].addEventListener("input", sliderCallback);
    xyzSliders[coord].addEventListener("change", sliderCallback);
    xyzScalers[coord].addEventListener("input", sliderCallback);
    xyzScalers[coord].addEventListener("change", sliderCallback);

  }
  this.xyzSliders = xyzSliders;
  this.xyzScalers = xyzScalers;

//  var resetButton = document.getElementById(this.canvasID + "-reset-button");
//  if (resetButton === null) {
//    alert("Reset button ID not found: " + this.canvasID + "-reset-button");
//    return;
//  }
  
  
  
  if (!canvas) {
      alert("Canvas ID '" + canvasID + "' not found.");
      return;
  }
  var gl = this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!gl) {
      alert("WebGL isn't available in this browser");
      return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Compile and link shaders
  this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
  if (this.shaderProgram === null) return;
  gl.useProgram(this.shaderProgram);

  // Load vertex coordinates into WebGL buffer
  this.vertexCoordBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer );
  gl.bufferData(gl.ARRAY_BUFFER, this.flattenedVertexCoords, gl.STATIC_DRAW );
  
  // Associate buffer with shader variable vPosition
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vPosition);
    
  // Initialize the vertex colors such that each face is a different color
  this.vertexColors = [];
  for (var face = 0; face < 6; ++face) {
    // Generate colors so that even faces have primary colors RGB
    // and opposite faces have complementary colors CMY
    var red = (face < 2) ? 1.0 : 0.0;
    var green = (face >= 2 && face < 4) ? 1.0 : 0.0;
    var blue = (face >= 4) ? 1.0 : 0.0;
    if (face % 2 === 1) {
      red = 1.0 - red;
      green = 1.0 - green;
      blue = 1.0 - blue;
    }
    var faceColor = vec3(red, green, blue);

    for (var vertex = 0; vertex < 4; ++vertex) {  // set color for all 4 face vertices
      this.vertexColors.push(faceColor);
      faceColor = scale(0.75, faceColor);  // slighly different brightness on each
    }
  }

  // Load vertex colors into WebGL buffer
  this.vertexColorBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW );
  
  // Associate buffer with shader variable vColor
  this.vColor = gl.getAttribLocation(this.shaderProgram, "vColor");
  gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vColor);
  
  // Get uniform variable location for transform matrix
  this.mTransform = gl.getUniformLocation(this.shaderProgram, "mTransform");
  
  // Set initial rotation of cube
  this.rotateXDegrees = 0;
  this.rotateYDegrees = 0;
  this.rotateZDegrees = 0;
  
  // Set up callback to animate the cube
    var animate = function () {
      if(isPaused === false){
          t.rotateXDegrees += 0.5;
          t.rotateYDegrees += 1.0;
          t.rotateZDegrees += 0.25;
      } else {
          var sliderVals = t.getSliderCoords();
          t.rotateXDegrees = Number(sliderVals[0]);
          t.rotateYDegrees = Number(sliderVals[1]);
          t.rotateZDegrees = Number(sliderVals[2]);
      }
      //bound between -180 and 180 degrees    
      //update slide values
      xyzSliders["x"].value = t.rotateXDegrees < 180 ? t.rotateXDegrees : t.rotateXDegrees -= 360.0;
      xyzSliders["x"].valueDisplay.textContent = xyzSliders["x"].value;
      xyzSliders["y"].value = t.rotateYDegrees < 180 ? t.rotateYDegrees : t.rotateYDegrees -= 360.0;
      xyzSliders["y"].valueDisplay.textContent = xyzSliders["y"].value;
      xyzSliders["z"].value = t.rotateZDegrees < 180 ? t.rotateZDegrees : t.rotateZDegrees -= 360.0;
      xyzSliders["z"].valueDisplay.textContent = xyzSliders["z"].value;
      t.Render();
      requestAnimationFrame(animate);
    };
  //
    requestAnimationFrame(animate);
  };
//get slider values
ColorCube.prototype.getSliderCoords = function() {
    var coordValues = []
    for(var c in this.coords) {
        var aCoord = this.coords[c];
        var aCoordValue = this.xyzSliders[aCoord].value;
        coordValues[c] = aCoordValue;
    }
    return vec3(coordValues);
};

ColorCube.prototype.getScalerCoords = function() {
    var coordValues = []
    for(var c in this.coords) {
        var aCoord = this.coords[c];
        var aCoordValue = this.xyzScalers[aCoord].value;
        coordValues[c] = aCoordValue;
    }
    return vec3(coordValues);
};


// Cube face coordinates
ColorCube.prototype.vertexCoordsArray = [
        vec3(0.5,   -0.5,  -0.5),  // +x face
        vec3(0.5,    0.5,  -0.5),
        vec3(0.5,   -0.5,   0.5),
        vec3(0.5,    0.5,   0.5),

        vec3(-0.5,  -0.5,   0.5),  // -x face
        vec3(-0.5,   0.5,   0.5),
        vec3(-0.5,  -0.5,  -0.5),
        vec3(-0.5,   0.5,  -0.5),

        vec3(-0.5,   0.5,  -0.5),  // +y face
        vec3(-0.5,   0.5,   0.5),
        vec3( 0.5,   0.5,  -0.5),
        vec3( 0.5,   0.5,   0.5),

        vec3( 0.5,  -0.5,  -0.5),  // -y face
        vec3( 0.5,  -0.5,   0.5),
        vec3(-0.5,  -0.5,  -0.5),
        vec3(-0.5,  -0.5,   0.5),

        vec3(-0.5,  -0.5,   0.5),  // +z face
        vec3( 0.5,  -0.5,   0.5),
        vec3(-0.5,   0.5,   0.5),
        vec3( 0.5,   0.5,   0.5),

        vec3(-0.5,   0.5,  -0.5),  // -z face
        vec3( 0.5,   0.5,  -0.5),
        vec3(-0.5,  -0.5,  -0.5),
        vec3( 0.5,  -0.5,  -0.5)
     ];
ColorCube.prototype.numVertices = ColorCube.prototype.vertexCoordsArray.length;

// Since we don't modify the vertex coordinates, we can store a copy that's
// flattened so we don't have to reprocess every time we draw.
ColorCube.prototype.flattenedVertexCoords = 
      flatten(ColorCube.prototype.vertexCoordsArray);

/**
 * Render - draw the scene on the canvas
 * 
 */
ColorCube.prototype.Render = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Build transform and send to vertex shader
  var xRotateMat = rotateX(this.rotateXDegrees);
  var yRotateMat = rotateY(this.rotateYDegrees);
  var zRotateMat = rotateZ(this.rotateZDegrees);
  
  //var transformMat = mult(zRotateMat, mult(yRotateMat, xRotateMat));
  var transformMat = mult(yRotateMat, mult(xRotateMat, zRotateMat));
  var scaledMat = mult(transformMat, scalem(0.4,0.5,0.8));
  // Set transformation matrix for shader
  gl.uniformMatrix4fv(this.mTransform, false, flatten(scaledMat));

  // Draw each face as a 2-triangle strip
  for (var start = 0; start < this.numVertices; start += 4) {
    gl.drawArrays(gl.TRIANGLE_STRIP, start, 4);
  }
};
