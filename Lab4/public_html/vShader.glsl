// Vertex shader

attribute vec3 vPosition;  // position of vertex (x, y, z)
attribute vec3 vColor;     // color of vertex (r, g, b)
      
uniform mat4 mTransform;   // transform for vertex
      
varying vec3 fColor;       // output color to send to fragment shader

void main() {
  gl_Position = mTransform * vec4(vPosition, 1.0); // set vertex position
  fColor = vColor;         // output color to fragment shader
}

