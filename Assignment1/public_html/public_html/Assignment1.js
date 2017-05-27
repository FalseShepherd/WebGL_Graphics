/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/**
 * Assignment1 - COMP3801 Winter 2017
 *   Basic WebGL shaders, mouse events and coordinates
 * 
 */

// Constructor
//
// @param canvasID - string containing name of canvas to render.
//          Buttons and sliders should be prefixed with this string.
//
function Assignment1(canvasID /* name of canvas to render */) {
  this.canvasID = canvasID;
  this.canvas = document.getElementById(canvasID);
  if (!this.canvas) {
    alert("Canvas ID '" + canvasID + "' not found.");
  }
  this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!this.gl) {
    alert("WebGL isn't available in this browser");
    return;
  }

  this.init();
}

// Define prototype values common to all Assignment1 objects
Assignment1.prototype.gl = null;

Assignment1.prototype.toString = function () {
    return JSON.stringify(this);
};

Assignment1.prototype.init = function () {
    var canvas = this.canvas;
    var gl = this.gl;
    var t = this;  // make available to event handlers

  // WebGL setup

  gl.viewport(0, 0, canvas.width, canvas.height);

  // Compile and link shaders
    this.shaderProgram = initShaders(gl, "vShader.glsl", "fShader.glsl");
    if (this.shaderProgram === null)
      return;
    gl.useProgram(this.shaderProgram);

  // Array of initial vertex coordinates
  this.vertexCoords = [];
  this.LineCoords = [];
  this.circleCoords = [];
  
  // Load vertex coordinates into WebGL buffer
  this.vertexCoordBuffer = gl.createBuffer();  // get unique buffer ID number
  this.vertexLineCoordsBuffer = gl.createBuffer(); //Draws lines for triangles
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexCoords), gl.STATIC_DRAW);
  

  // Associate buffer with shader variable vPosition
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.vertexAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vPosition);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexLineCoordsBuffer);


  // Load vertex colors into WebGL buffer
  this.vertexColorBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexColors), gl.STATIC_DRAW);

  // Associate buffer with shader variable vColor
  this.vColor = gl.getAttribLocation(this.shaderProgram, "vColor");
  gl.vertexAttribPointer(this.vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(this.vColor);

  // Set up HTML user interface

  this.colors = ["r", "g", "b"];
  var rgbSliders = [];         // array of slider HTML elements
  var rgbSliderValues = [];    // array of slider value HTML elements

  // Set up an object with sliders for the three colors. The sliders are
  // accessed using "indices" of "r", "g", and "b".
  for (var i in this.colors) {
    var color = this.colors[i];
    var sliderID = this.canvasID + "-" + color + "-slider";
    rgbSliders[color] = document.getElementById(sliderID);
    if (rgbSliders[color] === null) {
      alert("Slider ID not found: " + sliderID);
      return;
    }
    var valueID = this.canvasID + "-" + color + "-value";
    rgbSliderValues[color] = document.getElementById(valueID);
    if (rgbSliders[color] === null) {
      alert("Slider value ID not found: " + sliderID);
      return;
    }
    rgbSliders[color].valueDisplay = rgbSliderValues[color];  // attach to slider

    // Callback for change of slider value
    var sliderCallback = function (e) {
      // Update text display for slider
      var color = e.target.value;
      e.target.valueDisplay.textContent = color;

      // Re-render canvas
      requestAnimationFrame(render);
    };
    // The "input" and "change" events work differently on IE from Chrome and
    // Firefox. We set up both types of events.
    rgbSliders[color].addEventListener("input", sliderCallback);
    rgbSliders[color].addEventListener("change", sliderCallback);
  }
  this.rgbSliders = rgbSliders;

  var resetButton = document.getElementById(this.canvasID + "-reset-button");
  if (resetButton === null) {
    alert("Reset button ID not found: " + this.canvasID + "-reset-button");
    return;
  }

  var updateBuffers = function() {
        // Load vertex coordinates into WebGL buffer
        t.vertexCoordBuffer = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, t.vertexCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(t.vertexCoords), gl.STATIC_DRAW);
      //  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(t.triangleCoords)));
        // Associate buffer with shader variable vPosition
        t.vPosition = gl.getAttribLocation(t.shaderProgram, "vPosition");
        gl.vertexAttribPointer(t.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(t.vPosition);
       
        //Draw Triangle Outline
        t.vertexLineCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, t.vertexLineCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(t.LineCoords), gl.STATIC_DRAW);
        t.vPosition = gl.getAttribLocation(t.shaderProgram, "vPosition");
        gl.vertexAttribPointer(t.vPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(t.vPosition);


        // Load vertex colors into WebGL buffer
        t.vertexColorBuffer = gl.createBuffer();  // get unique buffer ID number
        gl.bindBuffer(gl.ARRAY_BUFFER, t.vertexColorBuffer);
        //gl.bufferData(gl.ARRAY_BUFFER, flatten(t.triangleColors), gl.STATIC_DRAW);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(t.vertexColors), gl.STATIC_DRAW);

        // Associate buffer with shader variable vColor
        t.vColor = gl.getAttribLocation(t.shaderProgram, "vColor");
        gl.vertexAttribPointer(t.vColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(t.vColor);
  };

  // Set up callback to render a frame
  var render = function () {
    t.Render();
  };

  // Set up the callback for the reset button
  resetButton.addEventListener("click", function () {
    for (var i in rgbSliders) {
      rgbSliders[i].value = rgbSliders[i].max / 2;
      rgbSliders[i].valueDisplay.textContent =
              rgbSliders[i].value / rgbSliders[i].max;
    }
    t.vertexCoords.length = 0;
    t.vertexColors.length = 0;
    t.LineCoords.length = 0;
    //t.triangleCoords.length = 0;
    //t.triangleColors.length = 0;
    updateBuffers();
    requestAnimationFrame(render);
    
  });

  // Set up mouse tracking
  this.mouseDown = false;  // track mouse button state
  var mouseX = document.getElementById(this.canvasID + "-mousex");
  var mouseY = document.getElementById(this.canvasID + "-mousey");
  //clip coords
  var clipX = document.getElementById(this.canvasID + "-clipx");
  var clipY = document.getElementById(this.canvasID + "-clipy");
  
  var mouseButton = document.getElementById(this.canvasID + "-mousebutton");
  if (mouseX === null || mouseY === null || mouseButton === null) {
    alert("Mouse output HTML IDs not found");
    return;
  }

  // Add mouse event handlers
  canvas.addEventListener("mousedown", function (e) {
    // IE handles button ID different from everyone else. We'll just assume
    // that any button press is the left button.
    t.mouseDown = true;
    mouseButton.textContent = "down";
    //draw a point
    t.vertexCoords.push(vec3(cx, cy, 0.0));
    t.vertexColors.push(t.getSliderColor());
    if(t.vertexCoords.length % 4 != 0){
        t.LineCoords.push(vec3(cx, cy, 0.0));
    } else {
        t.LineCoords.length = 0;
    }
   // t.triangleCoords.vec2(cx, cy);
    //t.triangleCoords.push(t.getSliderColor());
    console.log("Vertex Added: " + t.vertexCoords[t.vertexCoords.length]);

    updateBuffers();
    t.Render();
  });
  canvas.addEventListener("mouseup", function (e) {
    // IE handles button ID different from everyone else. We'll just assume
    // that any button press is the left button.
    t.mouseDown = false;
    mouseButton.textContent = "up";
  });
  var cx = 0.0;
  var cy = 0.0;
  canvas.addEventListener("mousemove", function (e) {
    // Calculate mouse position relative to canvas. This unfortunately works
    // differently in different browsers. This method appears to work in Chrome,
    // Firefox, and IE 11.
    mouseX.textContent = e.pageX - e.target.offsetLeft;
    mouseY.textContent = e.pageY - e.target.offsetTop;
    //Clip
    
    //clipX.textContent = (2.0 * (e.pageX - e.target.offsetLeft) / (canvas.width - 1)) - 1.0;
    //clipY.textContent = 1.0 - (2.0 * (e.pageY - e.target.offsetTop) / (canvas.height - 1));
    cx = (2.0 * (e.pageX - e.target.offsetLeft) / (canvas.width - 1)) - 1.0;
    cy = 1.0 - (2.0 * (e.pageY - e.target.offsetTop) / (canvas.height - 1));
    clipX.textContent = cx;
    clipY.textContent = cy;
    
    //Continuous drawing while the mouse is held down
//    if(t.mouseDown == true) {
//        t.vertexCoords.push(vec3(cx, cy, 0.0));
//        t.vertexColors.push(t.getSliderColor());
//        //t.triangleCoords.push(vec2(cx, cy));
//        //t.triangleColors.push(t.getSliderColor());
//    }
//    updateBuffers();
//    t.Render();
  });

  // Kick things off with an initial rendering
  requestAnimationFrame(render);
};

/**
 * GetSliderColors - get the current RGB color represented by the sliders
 *   as a vec3.
 *   
 * @returns {vec3} current slider color
 */
Assignment1.prototype.getSliderColor = function () {
  // Build an array of color values based on the current slider colors
  var colorValues = [];
  for (var i in this.colors) {
    var color = this.colors[i];
    var colorValue = this.rgbSliders[color].value;
    colorValues[i] = colorValue;
  }

  return vec3(colorValues);
};

/**
 * Render - draw the frame
 *
 */
Assignment1.prototype.Render = function () {
  var gl = this.gl;
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, this.vertexCoords.length);
  console.log("vertexCoords Size: " + this.vertexCoords.length);
  console.log("LineCoords Size: " + this.LineCoords.length);

  gl.drawArrays(gl.LINE_LOOP, 0, this.LineCoords.length);
  gl.drawArrays(gl.TRIANGLES, 0, this.vertexCoords.length);


};

