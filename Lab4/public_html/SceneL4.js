/* 
 * COMP3801 Winter 2017 Lab 4
 *  
 * Scene object - define model placement in world coordinates
 */

"use strict";

/*
 * Constructor for Scene object. This object holds a list of models to render,
 * and a transform for each one.  The list is defined in a JSON file.  The
 * field named "models" in the JSON file defines the list.  This field is an
 * array of objects. Each object contains the "modelURL", a scale factor,
 * and the placement of the model frame in world frame as vec3 values for the
 * "location" point and "xBasis", "yBasis", and "zBasis" vectors for the frame.
 * The scale factor should be applied to the points before applying the frame
 * transform.
 * 
 * @param canvasID - string ID of canvas in which to render
 * @param sceneURL - URL of JSON file containing scene definition
 */

function Scene(canvasID, sceneURL) {
  // Set up WebGL context
  this.canvasID = canvasID;
  var canvas = this.canvas = document.getElementById(canvasID);
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
  
  // Load the scene definition
  var jScene = this.jScene = LoadJSON(sceneURL);
  var yDegrees = this.yDegrees = 0;
  var zDegrees = this.zDegrees = 0;
  if (jScene === null) return;  // scene load failed (LoadJSON alerts on error)
  
  // Load each model in the scene
  var loadedModels = this.loadedModels = [];  // array of models
  for (var i = 0; i < jScene.models.length; ++i) {
    // Load model from JSON and add to models array
    var jModel = jScene.models[i];
    var loadedModel = new JSONModel(gl, jModel.modelURL);
    if (loadedModel === null) return;  // failed to load a model
    loadedModels.push(loadedModel);
  }
  
  // Create a matrix stack to use for rendering
  this.matrixStack = new MatrixStack();
  
  // Start rendering
  var t = this;
  requestAnimationFrame(function() { t.Render(); } );
};

Scene.prototype.Render = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  // Initialize matrix stack
  this.matrixStack.LoadMatrix(mat4());  // load identity matrix
  
  // Render each loaded object with its transform
  for (var i = 0; i < this.loadedModels.length; ++i) {
    this.matrixStack.PushMatrix();
    
    // Build transforms here and post-multiply by matrix stack (MultMatrix)
    /**** COMPUTE AND INSERT TRANSFORM HERE ****/
    this.matrixStack.MultMatrix(rotateZ(this.zDegrees));
    this.matrixStack.MultMatrix(translate(this.jScene.models[i].location));
    this.matrixStack.MultMatrix(scalem(this.jScene.models[i].scale));
    this.matrixStack.MultMatrix(transpose(mat4(this.jScene.models[i].xBasis.concat(0),this.jScene.models[i].yBasis.concat(0),this.jScene.models[i].zBasis.concat(0), this.jScene.models[i].location.concat(1) )));
    
    //rotate along indivdual y position.
    this.matrixStack.MultMatrix(rotate(this.yDegrees, vec3(0, this.jScene.models[i].location[1], 0)));
    this.loadedModels[i].Render(this.matrixStack);
    this.matrixStack.PopMatrix();
  }
  this.yDegrees += 0.1;
  this.zDegrees+= 0.05;
  var t = this;
  requestAnimationFrame(function() { t.Render(); } );
};