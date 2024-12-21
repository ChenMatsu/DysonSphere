// TSL-Textures: Dyson sphere
// Altered from: https://github.com/boytchev/tsl-textures/blob/main/online/dyson-sphere.html

import { Color } from 'three';
import { exp, float, Fn, Loop, mix, positionLocal, vec3 } from 'three/tsl';

const noisea = Fn(([pos]) => {
  let p = pos
    .mul(5 ** 0.5)
    .fract()
    .toVar();
  p.addAssign(p.dot(p.add(vec3(31.4159, 27.1828, 14.142))));
  return p.z.mul(p.x.add(p.y)).fract().mul(2).sub(1);
});

const smooth = Fn(([x]) => {
  let t = x.oneMinus().clamp(0, 1).toVar();
  return t.mul(t).mul(float(3).sub(t.mul(2)));
});

const noiseg = Fn(([pos]) => {
  let minx = pos.x.floor().toVar();
  let maxx = minx.add(1).toVar();

  let miny = pos.y.floor().toVar();
  let maxy = miny.add(1).toVar();

  let minz = pos.z.floor().toVar();
  let maxz = minz.add(1).toVar();

  let dx = smooth(pos.x.fract()).toVar();
  let dy = smooth(pos.y.fract()).toVar();
  let dz = smooth(pos.z.fract()).toVar();

  let mx = smooth(dx.oneMinus()).toVar();
  let my = smooth(dy.oneMinus()).toVar();
  let mz = smooth(dz.oneMinus()).toVar();

  let n000 = noisea(vec3(minx, miny, minz)).mul(mx).mul(my).mul(mz).toVar();
  let n001 = noisea(vec3(minx, miny, maxz)).mul(mx).mul(my).mul(dz).toVar();
  let n010 = noisea(vec3(minx, maxy, minz)).mul(mx).mul(dy).mul(mz).toVar();
  let n011 = noisea(vec3(minx, maxy, maxz)).mul(mx).mul(dy).mul(dz).toVar();
  let n100 = noisea(vec3(maxx, miny, minz)).mul(dx).mul(my).mul(mz).toVar();
  let n101 = noisea(vec3(maxx, miny, maxz)).mul(dx).mul(my).mul(dz).toVar();
  let n110 = noisea(vec3(maxx, maxy, minz)).mul(dx).mul(dy).mul(mz).toVar();
  let n111 = noisea(vec3(maxx, maxy, maxz)).mul(dx).mul(dy).mul(dz).toVar();

  return n000.add(n001).add(n010).add(n011).add(n100).add(n101).add(n110).add(n111);
});

const dysonSphere = Fn((params) => {
  const pos = positionLocal
    .mul(exp(params.scale.div(2).add(0.5)))
    .add(params.seed)
    .toVar();
  const res = vec3().toVar();
  const factor = float(1).toVar();

  Loop(params.complexity.add(4), () => {
    res.addAssign(noiseg(pos.mul(factor)));
    factor.addAssign(factor);
  });

  return mix(params.background, params.color, res.x.add(1).div(5));
});

dysonSphere.defaults = {
  $name: 'Dyson sphere',
  scale: 2,
  complexity: 2,
  variation: 0,
  color: new Color(0xc0d0ff),
  background: new Color(0),
  seed: 0,
};

export { dysonSphere };
