import * as THREE from 'three'
import guid from 'short-uuid'

class GradientMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        opacity: { value: 0 },
        shadow: { value: 1 },
      },
      vertexShader: `
      varying vec2 vUv;
      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectionPosition = projectionMatrix * viewPosition;
        gl_Position = projectionPosition;
        vUv = uv;
      }`,
      fragmentShader: `
      uniform float opacity;
      uniform float shadow;
      varying vec2 vUv;


      float circle(in vec2 _st, in float _radius){
        vec2 dist = _st-vec2(0.5);
      return smoothstep(_radius-(_radius*3.),
                             _radius+(_radius*2.),
                             dot(dist,dist)*4.0);
    }
    
    
      void main() {
        float d = circle(vUv, .35);

        gl_FragColor = mix(vec4(1.,1.,1.,.7), mix(vec4(0.0, 0.0, 0.0, .5), vec4(0.0, 0.0, 0.0, 0.0), d), shadow);
        // gl_FragColor = vec4(1.);
      }`,
    })
  }
}

GradientMaterial.key = guid.generate()

export { GradientMaterial }
