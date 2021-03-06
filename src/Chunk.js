import * as THREE from 'three';
import { CHUNK_SEGMENTS, SEGMENT_SIZE } from './constants';
import * as options from './options';


// const groundMaterial = new THREE.MeshLambertMaterial({
//   vertexColors: THREE.FaceColors,
// });

const groundMaterial = new THREE.MeshPhongMaterial({
  vertexColors: THREE.FaceColors,
  flatShading: true,
  shininess: 10,
});

// const colors = [new THREE.Color(255, 0, 0), new THREE.Color(0, 255, 0), new THREE.Color(255, 255, 0)];
// const ranges = [0, 0.4, 0.6];

// const groundMaterial = new THREE.ShaderMaterial({
//   lights: true,

//   uniforms: {
//     colors: new THREE.Uniform(colors),
//     ranges: new THREE.Uniform(ranges),
//   },
// });

const groundRayCaster = new THREE.Raycaster(new THREE.Vector3(0, 10000, 0), new THREE.Vector3(0, -1, 0));

export default class Chunk {

  static SIZE = CHUNK_SEGMENTS * SEGMENT_SIZE;

  constructor(x, z, lod = 1) {
    this.x = x;
    this.z = z;
    this.lod = lod;
    this.mesh = null;
    this.isChunk = true;
  }

  getHeightAt(x, z) {
    if (!this.mesh)
      return 0;

    // Slower than the below method, but it actually works...
    groundRayCaster.ray.origin.x = x;
    groundRayCaster.ray.origin.z = z;
    const inter = groundRayCaster.intersectObject(this.mesh);
    if (inter && inter.length)
      return inter[0].point.y;
      
    return 0;

    // x -= this.x * Chunk.SIZE;
    // z -= this.z * Chunk.SIZE;

    // x /= SEGMENT_SIZE;
    // z /= SEGMENT_SIZE;

    // // Get integer floor of x, z
    // const ix = Math.floor(x);
    // const iz = Math.floor(z);
    // // Get real (fractional) component of x, z
    // // This is the amount of each into the cell
    // const rx = x - ix;
    // const rz = z - iz;
    // // Edges of cell
    // const size = CHUNK_SEGMENTS;
    // const array = this._geometryPositions;
    // const a = array[(iz * size + ix) * 3 + 1];
    // const b = array[(iz * size + (ix + 1)) * 3 + 1];
    // const c = array[((iz + 1) * size + (ix + 1)) * 3 + 1];
    // const d = array[((iz + 1) * size + ix) * 3 + 1];
    // // Interpolate top edge (left and right)
    // const e = (a * (1 - rx) + b * rx);
    // // Interpolate bottom edge (left and right)
    // const f = (c * rx + d * (1 - rx));
    // // Interpolate between top and bottom
    // const y = (e * (1 - rz) + f * rz);
    // return y || 0.0;
  }

  setLOD(lod) {
    if (this.lod === lod) return;

    this.mesh.geometry.dispose();
  }

  setTerrain(attr) {

    const geometry = new THREE.BufferGeometry();
    for (const key of ['position', 'color', 'uv', 'normal']) {
      const { array, itemSize, normalized } = attr[key];
      geometry.addAttribute(key, new THREE.BufferAttribute(array, itemSize, normalized));
    }

    this.mesh = new THREE.Mesh(geometry, groundMaterial.clone());
    this.mesh.matrixAutoUpdate = false;
    this.mesh.position.set((this.x + 0.5) * Chunk.SIZE, 0, (this.z + 0.5) * Chunk.SIZE);
    this.mesh.updateMatrix();
    this.mesh.castShadow = this.mesh.receiveShadow = options.get('shadows');
  }

}
