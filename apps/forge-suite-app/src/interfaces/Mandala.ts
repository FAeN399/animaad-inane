export interface RingSpec {
  id: string;
  symmetry: number;
}

export interface ElementSpec {
  id: string;
  ringId: string;
  angle: number; // radians
  type: 'circle';
}

export interface MandalaState {
  rings: RingSpec[];
  elements: ElementSpec[];
}