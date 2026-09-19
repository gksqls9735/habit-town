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
  'pet-cushion': {
    height: 82,
    initialX: 0.58,
    initialY: 0.82,
    width: 146,
    zIndex: 1,
  },
};

export function getDecorPresentation(itemId: string): DecorPresentation {
  return decorPresentations[itemId] ?? defaultDecorPresentation;
}
