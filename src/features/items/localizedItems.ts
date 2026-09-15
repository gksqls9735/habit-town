import type { InventoryItem } from '../inventory/types';
import type { DeliveryReward } from '../rewards/eventRewards';
import type { Translate } from '../i18n';
import type { ShopItem } from '../shop/items';

type ItemLike = InventoryItem | ShopItem | DeliveryReward;

export function getLocalizedItemName(item: ItemLike, t: Translate) {
  if ('kind' in item && item.kind === 'currency') {
    return t(`rewards.${item.id}.name`, undefined, item.name);
  }

  return t(`items.${item.id}.name`, undefined, item.name);
}

export function getLocalizedItemDescription(item: InventoryItem | ShopItem, t: Translate) {
  return t(`items.${item.id}.description`, undefined, item.description);
}

export function getLocalizedInventoryItem(item: InventoryItem, t: Translate): InventoryItem {
  return {
    ...item,
    description: getLocalizedItemDescription(item, t),
    name: getLocalizedItemName(item, t),
  };
}
