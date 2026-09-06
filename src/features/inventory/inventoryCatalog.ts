import { InventoryItem } from './types';

export const starterInventoryItems: readonly InventoryItem[] = [
  { category: 'tool', description: '작은 수리에 사용할 수 있는 기본 도구예요.', equipped: false, id: 'starter-hammer', isNew: true, name: '튼튼한 망치', quantity: 1, symbol: 'T' },
  { category: 'pet-care', description: '펫의 기분을 조금 회복시켜 주는 간식이에요.', equipped: false, id: 'starter-snack', isNew: true, name: '별사탕 간식', quantity: 3, symbol: '*' },
  { category: 'material', description: '방 꾸미기 아이템 제작에 쓰이는 반짝이는 조각이에요.', equipped: false, id: 'starter-crystal', isNew: false, name: '하늘빛 결정', quantity: 5, symbol: '<>' },
];
