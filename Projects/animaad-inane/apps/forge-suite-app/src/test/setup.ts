import '@testing-library/jest-dom';
import ResizeObserver from 'resize-observer-polyfill';

// Mock ResizeObserver
global.ResizeObserver = ResizeObserver;

// Mock the canvas element
class MockCanvas {
  getContext() {
    return {
      fillRect: () => {},
      clearRect: () => {},
      getImageData: () => ({ data: new Array(4) }),
      putImageData: () => {},
      createImageData: () => [],
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      arc: () => {},
      fill: () => {},
      measureText: () => ({ width: 0 }),
      transform: () => {},
      rect: () => {},
    };
  }
}

// Mock WebGL context
const mockWebGL = {
  createBuffer: () => ({}),
  createProgram: () => ({}),
  createShader: () => ({}),
  shaderSource: () => {},
  compileShader: () => {},
  attachShader: () => {},
  linkProgram: () => {},
  getProgramParameter: () => true,
  useProgram: () => {},
  getAttribLocation: () => 0,
  getUniformLocation: () => ({}),
  enableVertexAttribArray: () => {},
  bindBuffer: () => {},
  bufferData: () => {},
  vertexAttribPointer: () => {},
  uniform1f: () => {},
  uniform2f: () => {},
  uniform3f: () => {},
  uniform4f: () => {},
  uniformMatrix2fv: () => {},
  uniformMatrix3fv: () => {},
  uniformMatrix4fv: () => {},
  drawArrays: () => {},
};

global.HTMLCanvasElement.prototype.getContext = function(contextType: string) {
  if (contextType === '2d') {
    return new MockCanvas().getContext('2d');
  }
  if (contextType.includes('webgl')) {
    return mockWebGL;
  }
  return null;
};