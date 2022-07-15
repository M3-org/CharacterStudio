function lerp(t, min, max, newMin, newMax) {
  const progress = (t - min) / (max - min);
  return newMin + progress * (newMax - newMin);
}

export function remapUVs({ mesh, uvs }) {
  // TODO: Should we mutate the existing geometry instead?
  // What is the appropriate contract between this function and
  // its calling context?
  const geometry = mesh.geometry.clone();
  mesh.geometry = geometry;

  const { min, max } = uvs;
  const uv = geometry.attributes.uv;
  if (uv) {
    for (let i = 0; i < uv.array.length; i += 2) {
      uv.array[i] = lerp(uv.array[i], 0, 1, min.x, max.x);
      uv.array[i + 1] = lerp(uv.array[i + 1], 0, 1, min.y, max.y);
    }
  }
  const uv2 = geometry.attributes.uv2;
  if (uv2) {
    for (let i = 0; i < uv2.array.length; i += 2) {
      uv2.array[i] = lerp(uv2.array[i], 0, 1, min.x, max.x);
      uv2.array[i + 1] = lerp(uv2.array[i + 1], 0, 1, min.y, max.y);
    }
  }
}
