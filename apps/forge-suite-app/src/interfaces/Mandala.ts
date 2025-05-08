export interface RingStyle {
  color: string;
  strokeWidth: number;
  opacity: number;
}

export interface RingSpec {
  id: string;
  symmetry: number;
  style: RingStyle;
}

export interface ElementSpec {
  id: string;
  ringId: string;
  angle: number; // radians
  type: 'circle';
  styleOverride?: RingStyle; // Optional override of ring-wide style
}

export interface MandalaState {
  rings: RingSpec[];
  elements: ElementSpec[];
}