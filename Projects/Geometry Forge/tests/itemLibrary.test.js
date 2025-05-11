// tests/itemLibrary.test.js
import * as THREE from 'three';
import { getAllItems } from '../src/core/itemLibrary.js';

// Simple test runner
function describe(description, fn) {
  console.log(`\n${description}`);
  fn();
}

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (error) {
    console.error(`✗ ${description}`);
    console.error(error);
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeInstanceOf(expected) {
      if (!(actual instanceof expected)) {
        throw new Error(`Expected instance of ${expected.name} but got ${actual.constructor.name}`);
      }
    },
    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    }
  };
}

// Mock THREE.js objects
global.THREE = {
  Group: class Group {
    constructor() {
      this.children = [];
      this.name = '';
    }
    add(child) {
      this.children.push(child);
    }
  },
  Mesh: class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { set: () => {} };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.name = '';
    }
  },
  Object3D: class Object3D {
    constructor() {
      this.children = [];
    }
    add(child) {
      this.children.push(child);
    }
  },
  BoxGeometry: class BoxGeometry {},
  SphereGeometry: class SphereGeometry {},
  CircleGeometry: class CircleGeometry {},
  TetrahedronGeometry: class TetrahedronGeometry {},
  IcosahedronGeometry: class IcosahedronGeometry {},
  DodecahedronGeometry: class DodecahedronGeometry {},
  OctahedronGeometry: class OctahedronGeometry {},
  TorusGeometry: class TorusGeometry {},
  PolyhedronGeometry: class PolyhedronGeometry {},
  RingGeometry: class RingGeometry {},
  BufferGeometry: class BufferGeometry {
    setFromPoints() {
      return this;
    }
  },
  Shape: class Shape {
    moveTo() {}
    lineTo() {}
    bezierCurveTo() {}
    ellipse() {}
  },
  ShapeGeometry: class ShapeGeometry {},
  Vector2: class Vector2 {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }
  },
  Vector3: class Vector3 {
    constructor(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
    set() {}
    clone() {
      return new THREE.Vector3(this.x, this.y, this.z);
    }
    multiplyScalar() {
      return this;
    }
  },
  Color: class Color {
    constructor() {}
    setHSL() {
      return this;
    }
    clone() {
      return new THREE.Color();
    }
    multiplyScalar() {
      return this;
    }
  },
  MeshStandardMaterial: class MeshStandardMaterial {
    constructor(params) {
      Object.assign(this, params);
    }
  },
  LineBasicMaterial: class LineBasicMaterial {
    constructor(params) {
      Object.assign(this, params);
    }
  },
  Line: class Line {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
    }
  },
  TextureLoader: class TextureLoader {
    load() {
      return {};
    }
  },
  MathUtils: {
    degToRad: (deg) => deg * (Math.PI / 180),
    radToDeg: (rad) => rad * (180 / Math.PI)
  }
};

// Tests
describe('Item Library', () => {
  test('getAllItems should return an array of items', () => {
    const items = getAllItems();
    expect(items).toBeDefined();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  test('Each item should have required properties', () => {
    const items = getAllItems();
    items.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(item.category).toBeDefined();
      expect(item.description).toBeDefined();
      expect(typeof item.generator).toBe('function');
    });
  });

  test('Item generators should create valid objects', () => {
    const items = getAllItems();
    items.forEach(item => {
      const obj = item.generator();
      expect(obj).toBeDefined();
      expect(obj).toBeInstanceOf(THREE.Object3D);
    });
  });

  test('Items should be organized in categories', () => {
    const items = getAllItems();
    const categories = new Set();
    items.forEach(item => categories.add(item.category));
    
    expect(categories.size).toBeGreaterThan(0);
    console.log('Categories:', Array.from(categories));
  });

  test('There should be 20 items in total', () => {
    const items = getAllItems();
    expect(items.length).toBe(20);
  });
});

// Run tests
console.log('Running Item Library Tests...');
