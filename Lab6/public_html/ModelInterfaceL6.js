/**
 * Generic interface to a model. Model classes inherit this prototype
 * to provide a uniform interface to all models.
 * 
 * COMP3801 Winter 2017
 *
 * @author Mike Goss (mikegoss@cs.du.edu)
 */

"use strict";

ModelInterface.prototype.modelName = undefined;
ModelInterface.prototype.gl = undefined;

/**
 * Constructor - Initialize object data
 * 
 * @param modelName - string for modelName field
 * @param gl - WebGL context for rendering
 */
function ModelInterface(modelName, gl) {
    this.modelName = modelName;
    this.gl = gl;
};

/**
* Return name of model (file name if loaded from file)
* 
* @return name of model
*/
ModelInterface.prototype.getName = function() {
    return this.modelName;
};

/**
 * Return string representation of model
 * 
 * @return string representation of model
 */
ModelInterface.prototype.toString = function() {
    return "[Model '" + this.getName() + "']";
};

/**
 * Redraw the model
 * 
 * @param matrixStack - the current MatrixStack object
 * @param projectionMatrix - the current projection matrix (mat4)
 * @param lightPositions - array of vec4 light positions
 * @param diffuseIntensities - array of vec3 light source diffuse intensities
 * @param ambientIntensities - array of vec3 light source ambient intensities
 * @param specularIntensities - array of vec3 light source ambient intensities
 * @param showEdges false to draw filled triangles, true for wireframe
 */
ModelInterface.prototype.Redraw = 
        function(matrixStack, projectionMatrix, lightPositions,
                 diffuseIntensities, ambientIntensities, specularIntensities,
                 showEdges) {
    alert("Redraw not defined for object " + this.getName());
};
