// Fragment shader for TextureCube
precision mediump float;

// Light information.  Four lights are supported.  Light intensities are
// stored in a mat4, one per row.
uniform mat4 fLightDiffuse;
uniform mat4 fLightAmbient;
uniform mat4 fLightSpecular;

// Light on/off information for the 4 light sources.  For light i,
// fLightOn is non-zero to use the light, 0 to ignore it.
uniform vec4 fLightOn;

// Texture variables
uniform sampler2D fTexSampler;
uniform sampler2D fBumpSampler;
uniform int fShowTexture;  // non-zero to show texture

// Interpolated input values from vertex shader
varying vec4 fNormal;
varying vec4 fTangent;
varying mat4 fLightDir;
varying vec4 fDiffuse;
varying vec4 fSpecular;
varying mat4 fLightHalfway;
varying float fShininess;
varying vec2 fTexCoord;

void main()
{
  vec4 shade = vec4(0.0, 0.0, 0.0, 0.0);     // initialize shade sum
  vec4 normal = normalize(fNormal);          // must normalize interpolated vector
  vec4 diffuse = fDiffuse;

  // If using texture
  if (fShowTexture != 0) {
    // Use texture value as diffuse reflectance
    diffuse = texture2D(fTexSampler, fTexCoord);

    // Adjust normal by bump map value
    
    // ******************** TODO ********************
    // Add your code here to use the bump map (fBumpSampler) to
    // alter the normal vector.
    vec4 bumps = texture2D(fBumpSampler, fTexCoord);
    vec3 t2 = normalize(cross(vec3(normal[0], normal[1], normal[2]), vec3(fTangent[0], fTangent[1], fTangent[2])));
    vec3 t1 = cross(t2, vec3(normal[0], normal[1], normal[2]));
    float d1 = bumps[0]*2.0 -1.0;
    float d2 = bumps[1]*2.0 -1.0;
    normal = vec4(normalize(vec3(normal[0], normal[1], normal[2]) + d1*t1 + d2*t2), 0.0);
  }
  
  for (int i = 0; i < 4; ++i) {
    if (fLightOn[i] != 0.0) {
      shade += fLightAmbient[i] * diffuse;    // use diffuse reflectance for ambient
      
      // Normalize interpolated light vectors
      vec4 lightDir = normalize(fLightDir[i]);
      vec4 halfway = normalize(fLightHalfway[i]);

      // Compute diffuse and specular reflectance
      float diffuse_coeff = dot(normal, lightDir);
      if (diffuse_coeff > 0.0) {               // if light in front of surface
        // Add diffuse components
        shade += (fLightDiffuse[i] * diffuse) * diffuse_coeff;

        // Compute specular reflectance
        float specular_coeff = dot(normal, halfway);
        if (specular_coeff > 0.0) {
          shade += fLightSpecular[i] * fSpecular * pow(specular_coeff, fShininess);
        }
      }
    }
  }
  shade.a = 1.0;
  gl_FragColor = shade;
}
