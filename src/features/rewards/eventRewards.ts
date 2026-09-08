import { InventoryItem } from '../inventory/types';
import {
  ItemCatalogRewardRarity,
  itemCatalogEntries,
} from '../items/itemCatalog';

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
      imageUrl: string | null;
      item: InventoryItem;
      kind: 'item';
      name: string;
      rarity: DeliveryRewardRarity;
    };

export type DeliveryRewardRarity = ItemCatalogRewardRarity;

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
  ...createDeliveryItemRewardEntries(),
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

function createDeliveryItemRewardEntries(): WeightedDeliveryReward[] {
  return itemCatalogEntries.flatMap(([code, catalogItem]) => {
    const deliveryReward = catalogItem.reward?.delivery;

    if (!deliveryReward) {
      return [];
    }

    return [{
      reward: {
        id: code,
        imageUrl: catalogItem.imageUrl,
        item: {
          category: catalogItem.category,
          description: catalogItem.description,
          equipped: false,
          id: code,
          isNew: true,
          name: catalogItem.name,
          quantity: deliveryReward.quantity,
          symbol: catalogItem.symbol,
        },
        kind: 'item',
        name: catalogItem.name,
        rarity: deliveryReward.rarity,
      },
      weight: deliveryReward.weight,
    }];
  });
}
