export type DecorPresentation = {
  height: number;
  initialX: number;
  initialY: number;
  width: number;
  zIndex: number;
};

const defaultDecorPresentation: DecorPresentation = {
  height: 64,
  initialX: 0.5,
  initialY: 0.5,
  width: 64,
  zIndex: 2,
};

const decorPresentations: Partial<Record<string, DecorPresentation>> = {
  'coral-floor-lamp': {
    height: 142,
    initialX: 0.78,
    initialY: 0.73,
    width: 142,
    zIndex: 2,
  },
  'low-bookshelf': {
    height: 132,
    initialX: 0.28,
    initialY: 0.72,
    width: 148,
    zIndex: 2,
  },
  'pet-food-bowl': {
    height: 96,
    initialX: 0.68,
    initialY: 0.84,
    width: 96,
    zIndex: 2,
  },
  'pet-cushion': {
    height: 82,
    initialX: 0.58,
    initialY: 0.82,
    width: 146,
    zIndex: 1,
  },
  'pet-rug': {
    height: 160,
    initialX: 0.5,
    initialY: 0.82,
    width: 240,
    zIndex: 0,
  },
  'potted-sprout': {
    height: 104,
    initialX: 0.72,
    initialY: 0.82,
    width: 104,
    zIndex: 2,
  },
  'sprout-wall-art': {
    height: 132,
    initialX: 0.7,
    initialY: 0.34,
    width: 132,
    zIndex: 2,
  },
  'toy-ball': {
    height: 110,
    initialX: 0.34,
    initialY: 0.83,
    width: 126,
    zIndex: 2,
  },
  'toy-storage-basket': {
    height: 118,
    initialX: 0.25,
    initialY: 0.82,
    width: 118,
    zIndex: 2,
  },
  'wall-clock': {
    height: 104,
    initialX: 0.72,
    initialY: 0.28,
    width: 104,
    zIndex: 2,
  },
};

export function getDecorPresentation(itemId: string): DecorPresentation {
  return decorPresentations[itemId] ?? defaultDecorPresentation;
}
