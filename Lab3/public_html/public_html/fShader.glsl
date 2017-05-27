// Fragment shader
precision mediump float;   // required precision declaration

varying vec3 fColor;       // input color for fragment

void main() {
  gl_FragColor = vec4(fColor, 1.0);
}
