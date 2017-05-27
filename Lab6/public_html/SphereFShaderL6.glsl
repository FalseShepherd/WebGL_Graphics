// Fragment shader for Sphere
precision mediump float;

// Light information.  Four lights are supported.  Light intensities are
// stored in a mat4, one per row.
uniform mat4 fLightDiffuse;
uniform mat4 fLightAmbient;
uniform mat4 fLightSpecular;

// Light on/off information for the 4 light sources.  For light i,
// fLightOn is non-zero to use the light, 0 to ignore it.
uniform vec4 fLightOn;

// Interpolated input values from vertex shader
varying vec4 fNormal;
varying mat4 fLightDir;
varying vec4 fSpecular;
varying mat4 fLightHalfway;
varying float fShininess;

void main()
{
  vec4 shade = vec4(0.0, 0.0, 0.0, 0.0);     // initialize shade sum
  vec4 normal = normalize(fNormal);          // must normalize interpolated vector
  vec4 fDiffuse = vec4(1.0, 1.0, 1.0, 1.0);  // use white as diffuse color
  
  for (int i = 0; i < 4; ++i) {
    if (fLightOn[i] != 0.0) {
      shade += fLightAmbient[i] * fDiffuse;    // use diffuse reflectance for ambient
      
      // Normalize interpolated light vectors
      //**** TODO: Add your code here ****//
       vec4 normLV = normalize(fLightDir[i]);
      
      // Compute diffuse and specular reflectance
      // (remember to check for and discard negative light values)
      //**** TODO: Add your code here ****// 
    shade+= fDiffuse*fLightDiffuse[i]*(dot(normLV, normal));
    if(pow(dot(normal, fLightHalfway[i]),fShininess) < 0.0){
    }
    else{
    shade+= fSpecular*fLightSpecular[i]*pow(dot(normal, fLightHalfway[i]),fShininess);
    }
    }
  }
  shade.a = 1.0;
  gl_FragColor = shade;
}
