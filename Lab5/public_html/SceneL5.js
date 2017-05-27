/*
 * COMP3801 Winter 2017 Lab 5
 *  
 * Scene object - define model placement in world coordinates
 */

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
  var t = this;
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
  
  // Add key press event handler
  canvas.addEventListener("keypress", function(event) { t.KeyInput(event); });
  
  // Load the scene definition
  var jScene = this.jScene = LoadJSON(sceneURL);
  if (jScene === null) return;  // scene load failed (LoadJSON alerts on error)

  // Set up WebGL rendering settings
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.enable(gl.DEPTH_TEST);
  var bgColor = [ 0, 0, 0, 1 ];
  if ("bgColor" in jScene) {
    bgColor = jScene["bgColor"];
  }
  gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
  
  // Set up User Interface elements
  this.fovSliderID = canvasID + "-fov-slider";
  this.fovSlider = document.getElementById(this.fovSliderID);
  
  this.nearSliderID = canvasID + "-near-slider";
  this.nearSlider = document.getElementById(this.nearSliderID);
  
  this.farSliderID = canvasID + "-far-slider";
  this.farSlider = document.getElementById(this.farSliderID);
  
  this.zSliderID = canvasID + "-z-slider";
  this.zSlider = document.getElementById(this.zSliderID);
  
  this.perspectiveCheckBoxID = canvasID + "-projection";
  this.perspectiveCheckBox = document.getElementById(this.perspectiveCheckBoxID);
  
  // Get the initial camera parameters (copy values so we can change them
  // without modifying the jScene object, we might want the original values
  // to do a reset.
  this.ResetCamera();
  
  // Load each model in the scene
  var loadedModels = this.loadedModels = [];  // array of models
  for (var i = 0; i < jScene.models.length; ++i) {
    // Load model from JSON and add to loadedModels array
    var jModel = jScene.models[i];
    var model = new JSONModel(gl, jModel.modelURL);
    if (model === null) return;  // failed to load a model
    loadedModels.push(model);
  }
  this.preRotationDegrees = 0.0;
  this.postRotationDegrees = 0.0;
  this.iteration =0;
  // Start rendering
  requestAnimationFrame(function() { t.Render(); } );
};

Scene.prototype.Render = function() {
  var gl = this.gl;
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  var camera = this.camera;
  
  // Compute aspect ratio of canvas
  var aspect = this.canvas.width / this.canvas.height;
  
  // Build projection matrix
  var projection = [];
  camera.FOVdeg = parseFloat(this.fovSlider.value);
  camera.near = parseFloat(this.nearSlider.value);
  camera.far = parseFloat(this.farSlider.value);
  camera.location = [camera.location[0], camera.location[1], parseFloat(this.zSlider.value)];
  camera.perspective = this.perspectiveCheckBox.checked;
  
  if (camera.perspective) {
    projection = perspective(camera.FOVdeg, aspect, 
                             camera.near, camera.far);
  } else {
    projection = ortho(-aspect, aspect, -1.0, 1.0, 
                       camera.near, camera.far);
  }
  
  // Build view transform and initialize matrix stack
  var matrixStack = new MatrixStack;
  matrixStack.LoadMatrix(
          lookAt(camera.location, camera.lookAt, camera.approxUp));
  
  // Render each loaded object with its transform
  for (var i = 0; i < this.loadedModels.length; ++i) {
    // Build transform from JSON and add to transforms array
    var jModel = this.jScene.models[i];
    var ms = scalem(jModel.scale);
//    if(i ==0 || i==1){
//    var mt = translate(jModel.path[this.iteration+1]);
//    //alert(this.jScene.models[i].path[this.iteration]);
//    }
//    else{
    var mt = translate(jModel.location);
    //}
    
    var mry = rotateY(this.preRotationDegrees);
    
    var mf = mat4(jModel.xBasis[0], jModel.yBasis[0], jModel.zBasis[0], 0.0,
                  jModel.xBasis[1], jModel.yBasis[1], jModel.zBasis[1], 0.0,
                  jModel.xBasis[2], jModel.yBasis[2], jModel.zBasis[2], 0.0,
                  0.0,              0.0,              0.0,              1.0);
    var transform = mult(mt, mult(mf, mult(mry,ms)));
    
    matrixStack.PushMatrix();
    matrixStack.MultMatrix(transform);
    this.loadedModels[i].Render(projection, matrixStack);
    matrixStack.PopMatrix();
    
    this.preRotationDegrees += 0.1;
    if (this.preRotationDegrees > 180) this.preRotationDegrees -= 360;
  }
  this.iteration++;
  if(this.iteration >= 129)
  {
      this.iteration =0;
  }
  var t = this;
  requestAnimationFrame(function() { t.Render(); } );
};

Scene.prototype.ResetCamera = function() {
  // Copy the camera parameters from the jScene object.  The copy's values
  // are independent of the originals, so changes won't affect the originals.
  this.camera = {};
  this.camera.location = this.jScene.camera.location.slice();
  this.camera.lookAt = this.jScene.camera.lookAt.slice();
  this.camera.approxUp = this.jScene.camera.approxUp.slice();
  this.camera.FOVdeg = this.jScene.camera.FOVdeg;
  this.camera.near = this.jScene.camera.near;
  this.camera.far = this.jScene.camera.far;
  this.camera.perspective = this.jScene.camera.perspective;

  // Set UI elements to the values defined in the scene files
  this.fovSlider.value = this.camera.FOVdeg;
  SliderUpdate(this.fovSliderID + "-output", this.camera.FOVdeg);

  this.nearSlider.value = this.camera.near;
  SliderUpdate(this.nearSliderID + "-output", this.camera.near);

  this.farSlider.value = this.camera.far;
  SliderUpdate(this.farSliderID + "-output", this.camera.far);

  this.zSlider.value = 2;
  SliderUpdate(this.zSliderID + "-output", 2);
  
  this.perspectiveCheckBox.checked = this.camera.perspective;
};

Scene.prototype.KeyInput = function(event) {
  // Get character from event
  var c = String.fromCharCode(event.which);
  console.log("keyboard input character = " + c);  // this line may be removed
  
  // If numeric, switch view to selected object
  var atModel = parseInt(c);
  if (!isNaN(atModel)) {
    //
    // YOUR CODE HERE - switch view to selected model, 0 through max
    //
    if(atModel == 0)
    {
        this.ResetCamera();
    }
    if(atModel <= this.jScene.models.length){
        this.camera.lookAt = this.jScene.models[atModel -1].location;
    }
    
  }
};