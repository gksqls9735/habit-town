import { InventoryItem } from '../inventory/types';

export type DeliveryReward =
  | {
      amount: number;
      id: string;
      kind: 'currency';
      name: string;
      rarity: DeliveryRewardRarity;
    }
  | {
      id: string;
      item: InventoryItem;
      kind: 'item';
      name: string;
      rarity: DeliveryRewardRarity;
    };

export type DeliveryRewardRarity = 'common' | 'uncommon' | 'rare';

type WeightedDeliveryReward = {
  reward: DeliveryReward;
  weight: number;
};

const deliveryRewards: readonly WeightedDeliveryReward[] = [
  {
    reward: {
      amount: 90,
      id: 'animal-rescue-coins-small',
      kind: 'currency',
      name: '보호소 감사 골드',
      rarity: 'common',
    },
    weight: 34,
  },
  {
    reward: {
      amount: 150,
      id: 'animal-rescue-coins-medium',
      kind: 'currency',
      name: '따뜻한 후원 골드',
      rarity: 'uncommon',
    },
    weight: 24,
  },
  {
    reward: {
      amount: 260,
      id: 'animal-rescue-coins-large',
      kind: 'currency',
      name: '특별 감사 골드',
      rarity: 'rare',
    },
    weight: 10,
  },
  {
    reward: {
      id: 'animal-rescue-snack',
      item: {
        category: 'pet-care',
        description: '동물보호협회에서 보내준 마음이 담긴 간식이에요.',
        equipped: false,
        id: 'animal-rescue-snack',
        isNew: true,
        name: '보호소 간식',
        quantity: 1,
        symbol: 'S',
      },
      kind: 'item',
      name: '보호소 간식',
      rarity: 'common',
    },
    weight: 18,
  },
  {
    reward: {
      id: 'animal-rescue-fabric',
      item: {
        category: 'material',
        description: '방 꾸미기 제작에 쓸 수 있는 포근한 천 조각이에요.',
        equipped: false,
        id: 'animal-rescue-fabric',
        isNew: true,
        name: '포근한 천 조각',
        quantity: 2,
        symbol: 'F',
      },
      kind: 'item',
      name: '포근한 천 조각',
      rarity: 'uncommon',
    },
    weight: 10,
  },
  {
    reward: {
      id: 'animal-rescue-paw-charm',
      item: {
        category: 'decor',
        description: '작은 발자국 모양의 장식품이에요.',
        equipped: false,
        id: 'animal-rescue-paw-charm',
        isNew: true,
        name: '발자국 참',
        quantity: 1,
        symbol: 'P',
      },
      kind: 'item',
      name: '발자국 참',
      rarity: 'rare',
    },
    weight: 4,
  },
];

export function drawDeliveryReward(): DeliveryReward {
  const totalWeight = deliveryRewards.reduce((total, entry) => total + entry.weight, 0);
  let ticket = Math.random() * totalWeight;

  for (const entry of deliveryRewards) {
    ticket -= entry.weight;

    if (ticket <= 0) {
      return cloneReward(entry.reward);
    }
  }

  return cloneReward(deliveryRewards[0].reward);
}

function cloneReward(reward: DeliveryReward): DeliveryReward {
  if (reward.kind === 'currency') {
    return { ...reward };
  }

  return {
    ...reward,
    item: { ...reward.item },
  };
}
