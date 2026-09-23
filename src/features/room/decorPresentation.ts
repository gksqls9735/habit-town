export type DecorPresentation = {
  dropBounds?: {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
  };
  height: number;
  initialX: number;
  initialY: number;
  placementBounds: {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
  };
  width: number;
  zIndex: number;
};

const defaultDecorPresentation: DecorPresentation = {
  height: 64,
  initialX: 0.5,
  initialY: 0.5,
  placementBounds: { maxX: 0.95, maxY: 0.94, minX: 0.05, minY: 0.08 },
  width: 64,
  zIndex: 2,
};

const decorPresentations: Partial<Record<string, DecorPresentation>> = {
  'coral-floor-lamp': {
    height: 142,
    initialX: 0.78,
    initialY: 0.73,
    placementBounds: { maxX: 0.95, maxY: 0.94, minX: 0.05, minY: 0.08 },
    width: 142,
    zIndex: 2,
  },
  'low-bookshelf': {
    dropBounds: { maxX: 0.9, maxY: 0.82, minX: 0.1, minY: 0.62 },
    height: 132,
    initialX: 0.28,
    initialY: 0.72,
    placementBounds: { maxX: 0.9, maxY: 0.72, minX: 0.1, minY: 0.72 },
    width: 148,
    zIndex: 2,
  },
  'pet-cushion': {
    height: 82,
    initialX: 0.58,
    initialY: 0.82,
    placementBounds: { maxX: 0.95, maxY: 0.94, minX: 0.05, minY: 0.08 },
    width: 146,
    zIndex: 1,
  },
  'sprout-wall-art': {
    height: 132,
    initialX: 0.7,
    initialY: 0.34,
    placementBounds: { maxX: 0.82, maxY: 0.62, minX: 0.18, minY: 0.14 },
    width: 132,
    zIndex: 2,
  },
  'toy-storage-basket': {
    height: 118,
    initialX: 0.25,
    initialY: 0.82,
    placementBounds: { maxX: 0.84, maxY: 0.9, minX: 0.16, minY: 0.74 },
    width: 118,
    zIndex: 2,
  },
};

export function getDecorPresentation(itemId: string): DecorPresentation {
  return decorPresentations[itemId] ?? defaultDecorPresentation;
}
