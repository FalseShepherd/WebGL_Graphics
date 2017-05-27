/* global WebGLUtils */

/**
 * Lab 2 - COMP3801 Winter 2017
 *   Basic WebGL shaders, mouse events and coordinates
 * 
 * @author Mike Goss (mikegoss@cs.du.edu)
 */

"use strict";

// Constructor
//
// @param canvasID - string containing name of canvas to render.
//          Buttons and sliders should be prefixed with this string.
//
function Lab2(canvasID /* name of canvas to render */) {
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

// Define prototype values common to all Lab2 objects
Lab2.prototype.gl = null;

Lab2.prototype.toString = function () {
  return JSON.stringify(this);
};

Lab2.prototype.init = function () {
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
  this.TriangleCoords = [
  ];

  // Load vertex coordinates into WebGL buffer
  this.TriangleCoordBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, this.TriangleCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(this.TriangleCoords), gl.STATIC_DRAW);

  // Associate buffer with shader variable vPosition
  this.vPosition = gl.getAttribLocation(this.shaderProgram, "vPosition");
  gl.TriangleAttribPointer(this.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableTriangleAttribArray(this.vPosition);

  // Array of vertex colors corresponding to vertex coordinates
  this.vertexColors = [
    vec3(1.0, 1.0, 1.0),
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
    vec3(1.0, 1.0, 0.0)
  ];

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
    BufferRefresh();
    requestAnimationFrame(render);
  });

  // Set up mouse tracking
  this.mouseDown = false;  // track mouse button state
  var clipX = document.getElementById(this.canvasID + "-clipX");
  var clipY = document.getElementById(this.canvasID + "-clipY");
  var mouseX = document.getElementById(this.canvasID + "-mousex");
  var mouseY = document.getElementById(this.canvasID + "-mousey");
  var mouseButton = document.getElementById(this.canvasID + "-mousebutton");
  var cx = 0.0;
  var cy = 0.0;
  if (mouseX === null || mouseY === null || mouseButton === null) {
    alert("Mouse output HTML IDs not found");
    return;
  }

  /*
 * Buffer Refresh
 * 
 */
var BufferRefresh = function() {
  t.vertexCoordBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, t.vertexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(t.vertexCoords), gl.STATIC_DRAW);

  // Associate buffer with shader variable vPosition
  t.vPosition = gl.getAttribLocation(t.shaderProgram, "vPosition");
  gl.vertexAttribPointer(t.vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(t.vPosition);  
  
   // Load vertex colors into WebGL buffer
  t.vertexColorBuffer = gl.createBuffer();  // get unique buffer ID number
  gl.bindBuffer(gl.ARRAY_BUFFER, t.vertexColorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(t.vertexColors), gl.STATIC_DRAW);

  // Associate buffer with shader variable vColor
  t.vColor = gl.getAttribLocation(t.shaderProgram, "vColor");
  gl.vertexAttribPointer(t.vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(t.vColor);
}

  // Add mouse event handlers
  canvas.addEventListener("mousedown", function (e) {
    // IE handles button ID different from everyone else. We'll just assume
    // that any button press is the left button.
    t.mouseDown = true;
    mouseButton.textContent = "down";
    var point = vec3(cx, cy, 0.0);
    var pColor = vec3(t.getSliderColor());
    t.vertexColors.push(pColor);
    BufferRefresh();
    t.Render();
  });
  canvas.addEventListener("mouseup", function (e) {
    // IE handles button ID different from everyone else. We'll just assume
    // that any button press is the left button.
    t.mouseDown = false;
    mouseButton.textContent = "up";
    
  });
 
 
  canvas.addEventListener("mousemove", function (e) {
    // Calculate mouse position relative to canvas. This unfortunately works
    // differently in different browsers. This method appears to work in Chrome,
    // Firefox, and IE 11.
    if(t.mouseDown == true)
    {
    var point = vec3(cx, cy, 0.0);
    t.vertexCoords.push(point);
    var pColor = vec3(t.getSliderColor());
    t.vertexColors.push(pColor);
    BufferRefresh();
    t.Render(); 
    }
    mouseX.textContent = e.pageX - e.target.offsetLeft;
    mouseY.textContent = e.pageY - e.target.offsetTop;
    cx = (2.0 * (e.pageX - e.target.offsetLeft) / (canvas.width - 1)) - 1.0;
    cy = 1.0 - (2.0 * (e.pageY - e.target.offsetTop) / (canvas.height - 1));
    clipX.textContent = cx;
    clipY.textContent = cy;
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
Lab2.prototype.getSliderColor = function () {
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
Lab2.prototype.Render = function () {
  var gl = this.gl;
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, this.vertexCoords.length);
};