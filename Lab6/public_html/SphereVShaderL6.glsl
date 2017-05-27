// Vertex shader for Sphere

// Per-vertex variables
attribute vec4 vPosition;
attribute vec4 vNormal;
attribute vec4 vSpecular;
attribute float vShininess;

// Light information.  Four lights are supported.  Light positions are
// stored in a mat4, one light position per row. If the last (w) coordinate
// of the light position is 0, it is treated as a directional light source.
uniform mat4 vLightPos;  // light pos in viewing coord

// Light on/off information for the 4 light sources.  For vLightPos[i],
// vLightOn is non-zero to use the light, 0 to ignore it.
uniform vec4 vLightOn;

// Transformations
uniform mat4 vModelViewMatrix;
uniform mat4 vProjectionMatrix;

// Interpolated output values for fragment shader
varying vec4 fSpecular;         // specular reflectivity
varying float fShininess;       // shininess coeff (beta)
varying vec4 fNormal;           // surface normal vector

// The light direction and halfway vectors have one per light source.  We
// pack these into mat4, one per row
varying mat4 fLightHalfway;     // halfway vector
varying mat4 fLightDir;         // light direction vector

void main()
{
  vec4 normal = vec4(vNormal.xyz, 0.0);  // make sure last coord is 0

  // Transform the position and normal vector to viewing coord
  vec4 position_in_vc = vModelViewMatrix * vPosition;
  gl_Position = vProjectionMatrix * position_in_vc;
  fNormal = normalize(vModelViewMatrix * normal);

  // Compute vector from point to each light source
  for (int i = 0; i < 4; ++i) {
    if (vLightOn[i] != 0.0) {

      // Compute direction to the light
      vec4 to_light;
      if (vLightPos[i].w != 0.0) {  // if point source
        
        // TODO: to_light is vector from vertex position in viewing coords
        //       to the light source position
        to_light = vLightPos[i] - position_in_vc;
      } else {                      // directional source
        
        // TODO: to_light is just the light source vector
        to_light = fLightDir[i];

      }
      fLightDir[i] = to_light;

      // Compute halfway vector - this will be interpolated between vertices.
      // Remember that it should be a unit vector.
      // Notice that we're in viewing coordinates, so the vector to the eye
      // is just the vector to the origin.
      fLightHalfway[i] = normalize(to_light - position_in_vc); // *** TODO: compute halfway vector ***
    }
  }

  fSpecular = vSpecular;
  fShininess = vShininess;
}
 