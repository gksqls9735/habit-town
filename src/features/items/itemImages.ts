import type { ImageSourcePropType } from 'react-native';
import type { ItemCode } from './itemCatalog';

const itemImagesByCode: Partial<Record<ItemCode, ImageSourcePropType>> = {
  'pet-rug': require('../../../assets/png/objects/pet-rug.png'),
  'toy-ball': require('../../../assets/png/objects/toy-ball.png'),
  'pet-cushion': require('../../../assets/png/objects/pet-cushion.png'),
  'pet-food-bowl': require('../../../assets/png/objects/pet-food-bowl.png'),
  'wall-clock': require('../../../assets/png/objects/wall-clock.png'),
  'potted-sprout': require('../../../assets/png/objects/potted-sprout.png'),
  'coral-floor-lamp': require('../../../assets/png/objects/coral-floor-lamp.png'),
  'low-bookshelf': require('../../../assets/png/objects/low-bookshelf-front.png'),
  'sprout-wall-art': require('../../../assets/png/objects/sprout-wall-art.png'),
  'toy-storage-basket': require('../../../assets/png/objects/toy-storage-basket.png'),
  'ivory-wallpaper': require('../../../assets/png/backgrounds/basic-room-wallpaper.png'),
  'cacao-flooring': require('../../../assets/png/backgrounds/basic-room-floor.png'),
  'sage-ivory-wallpaper': require('../../../assets/png/backgrounds/sage-ivory-wallpaper.png'),
  'powder-blue-wallpaper': require('../../../assets/png/backgrounds/powder-blue-wallpaper.png'),
  'strawberry-cream-wallpaper': require('../../../assets/png/backgrounds/strawberry-cream-wallpaper.png'),
  'cloud-sky-wallpaper': require('../../../assets/png/backgrounds/cloud-sky-wallpaper.png'),
  'sage-flower-wallpaper': require('../../../assets/png/backgrounds/sage-flower-wallpaper.png'),
  'dark-walnut-flooring': require('../../../assets/png/backgrounds/dark-walnut-flooring.png'),
  'white-oak-flooring': require('../../../assets/png/backgrounds/white-oak-flooring.png'),
  'herringbone-oak-flooring': require('../../../assets/png/backgrounds/herringbone-oak-flooring.png'),
  'mint-checker-flooring': require('../../../assets/png/backgrounds/mint-checker-flooring.png'),
  'terracotta-mosaic-flooring': require('../../../assets/png/backgrounds/terracotta-mosaic-flooring.png'),
  'clean-action-object': require('../../../assets/ui/action/clean-action-object-icon.png'),
  'pet-shampoo-action-object': require('../../../assets/png/objects/care/pet-shampoo-action-object-icon.png'),
  'pet-toothpaste-action-object': require('../../../assets/png/objects/care/pet-toothpaste-action-object-icon.png'),
  'dental-chew-action-object': require('../../../assets/png/objects/care/dental-chew-action-object-icon.png'),
  'premium-kibble-action-object': require('../../../assets/png/objects/care/premium-kibble-action-object-icon.png'),
  'treat-biscuit-jar-action-object': require('../../../assets/png/objects/care/treat-biscuit-jar-action-object-icon.png'),
  'wet-food-can-action-object': require('../../../assets/png/objects/care/wet-food-can-action-object-icon.png'),
  'special-meal-plate-action-object': require('../../../assets/png/objects/care/special-meal-plate-action-object-icon.png'),
  'bouncy-ball-action-object': require('../../../assets/png/objects/care/bouncy-ball-action-object-icon.png'),
  'plush-chick-action-object': require('../../../assets/png/objects/care/plush-chick-action-object-icon.png'),
  'feather-wand-action-object': require('../../../assets/png/objects/care/feather-wand-action-object-icon.png'),
  'rope-toy-action-object': require('../../../assets/png/objects/care/rope-toy-action-object-icon.png'),
  'play-tunnel-action-object': require('../../../assets/png/objects/care/play-tunnel-action-object-icon.png'),
  'feed-action-object': require('../../../assets/ui/action/feed-action-object-icon.png'),
  'play-action-object': require('../../../assets/ui/action/play-action-object-icon.png'),
};

export function getItemImage(itemId: string): ImageSourcePropType | undefined {
  return itemImagesByCode[itemId as ItemCode];
}
