/**
 * Lab 1 - COMP3801 Winter 2017
 * 
 * ColorSquareEvent - draw a square with UI elements to change color,
 *                    updating on events from slider or button.
 * 
 * @author Mike Goss (mikegoss@cs.du.edu)
 */

"use strict";

// Constructor
//
// @param canvasID - string containing name of canvas to render.
//          A slider with ID (canvasID + "-red-slider") and a
//          button with ID (canvasID + "-reset") should also have
//          been defined in the HTML document.
//
function ColorSquareEvent(canvasID /* name of canvas to render */) {
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
    console.log("ColorSquare Made");
    this.init();
}

// Define prototype values common to all ColorSquareEvent objects
ColorSquareEvent.prototype.gl = null;

ColorSquareEvent.prototype.toString = function() {
    return JSON.stringify(this);
};

ColorSquareEvent.prototype.init = function () {
    var canvas = this.canvas;
    var gl = this.gl;

    gl.viewport(0, 0, canvas.width, canvas.height);

    var redSlider = document.getElementById(this.canvasID + "-red-slider");
    var redSliderNumber = document.getElementById(this.canvasID + "-red-value");
    var greenSlider = document.getElementById(this.canvasID + "-green-slider");
    var greenSliderNumber = document.getElementById(this.canvasID + "-green-value");
    var blueSlider = document.getElementById(this.canvasID + "-blue-slider");
    var blueSliderNumber = document.getElementById(this.canvasID + "-blue-value");
    var resetButton = document.getElementById(this.canvasID + "-reset-button");

    var render = function () {
        redSliderNumber.textContent = redSlider.value;
        greenSliderNumber.textContent = greenSlider.value;
        blueSliderNumber.textContent = blueSlider.value;
        gl.clearColor(redSlider.value, greenSlider.value, blueSlider.value, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    };
    
    // The "input" and "change" events work differently on IE from Chrome and
    // Firefox. We set up both types of events.
    redSlider.addEventListener("input",
            function () {
                requestAnimationFrame(render);
            });
    redSlider.addEventListener("change",
            function () {
                requestAnimationFrame(render);
            });
    greenSlider.addEventListener("input",
            function () {
                requestAnimationFrame(render);
            });
    greenSlider.addEventListener("change",
            function () {
                requestAnimationFrame(render);
            });
    blueSlider.addEventListener("input",
            function () {
                requestAnimationFrame(render);
            });
    blueSlider.addEventListener("change",
            function () {
                requestAnimationFrame(render);
            });

    resetButton.addEventListener("click",
            function () {
                redSlider.value = 0.5;
                greenSlider.value = 0.5;
                blueSlider.value = 0.5;
                requestAnimationFrame(render);
            });

    requestAnimationFrame(render);
};
