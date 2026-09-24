import type { ImageSourcePropType } from 'react-native';
import type { ItemCode } from './itemCatalog';

const itemImagesByCode: Partial<Record<ItemCode, ImageSourcePropType>> = {
  'pet-rug': require('../../../assets/images/furniture/pet-rug.png'),
  'toy-ball': require('../../../assets/images/furniture/toy-ball.png'),
  'pet-cushion': require('../../../assets/images/furniture/pet-cushion.png'),
  'pet-food-bowl': require('../../../assets/images/furniture/pet-food-bowl-v2.png'),
  'wall-clock': require('../../../assets/images/furniture/wall-clock-v2.png'),
  'potted-sprout': require('../../../assets/images/furniture/potted-sprout.png'),
  'coral-floor-lamp': require('../../../assets/images/furniture/coral-floor-lamp.png'),
  'low-bookshelf': require('../../../assets/images/furniture/low-bookshelf-front.png'),
  'sprout-wall-art': require('../../../assets/images/furniture/sprout-wall-art.png'),
  'toy-storage-basket': require('../../../assets/images/furniture/toy-storage-basket.png'),
  'ivory-wallpaper': require('../../../assets/images/rooms/wallpapers/basic-room-wallpaper.png'),
  'cacao-flooring': require('../../../assets/images/rooms/flooring/basic-room-floor.png'),
  'sage-ivory-wallpaper': require('../../../assets/images/rooms/wallpapers/sage-ivory-wallpaper.png'),
  'powder-blue-wallpaper': require('../../../assets/images/rooms/wallpapers/powder-blue-wallpaper.png'),
  'strawberry-cream-wallpaper': require('../../../assets/images/rooms/wallpapers/strawberry-cream-wallpaper.png'),
  'cloud-sky-wallpaper': require('../../../assets/images/rooms/wallpapers/cloud-sky-wallpaper.png'),
  'sage-flower-wallpaper': require('../../../assets/images/rooms/wallpapers/sage-flower-wallpaper.png'),
  'dark-walnut-flooring': require('../../../assets/images/rooms/flooring/dark-walnut-flooring.png'),
  'white-oak-flooring': require('../../../assets/images/rooms/flooring/white-oak-flooring.png'),
  'herringbone-oak-flooring': require('../../../assets/images/rooms/flooring/herringbone-oak-flooring.png'),
  'mint-checker-flooring': require('../../../assets/images/rooms/flooring/mint-checker-flooring.png'),
  'terracotta-mosaic-flooring': require('../../../assets/images/rooms/flooring/terracotta-mosaic-flooring.png'),
  'clean-action-object': require('../../../assets/images/icons/actions/clean-action-object-icon.png'),
  'pet-shampoo-action-object': require('../../../assets/images/inventory/care/pet-shampoo-action-object-icon.png'),
  'pet-toothpaste-action-object': require('../../../assets/images/inventory/care/pet-toothpaste-action-object-icon.png'),
  'dental-chew-action-object': require('../../../assets/images/inventory/care/dental-chew-action-object-icon.png'),
  'premium-kibble-action-object': require('../../../assets/images/inventory/care/premium-kibble-action-object-icon.png'),
  'treat-biscuit-jar-action-object': require('../../../assets/images/inventory/care/treat-biscuit-jar-action-object-icon.png'),
  'wet-food-can-action-object': require('../../../assets/images/inventory/care/wet-food-can-action-object-icon.png'),
  'special-meal-plate-action-object': require('../../../assets/images/inventory/care/special-meal-plate-action-object-icon.png'),
  'bouncy-ball-action-object': require('../../../assets/images/inventory/care/bouncy-ball-action-object-icon.png'),
  'plush-chick-action-object': require('../../../assets/images/inventory/care/plush-chick-action-object-icon.png'),
  'feather-wand-action-object': require('../../../assets/images/inventory/care/feather-wand-action-object-icon.png'),
  'rope-toy-action-object': require('../../../assets/images/inventory/care/rope-toy-action-object-icon.png'),
  'play-tunnel-action-object': require('../../../assets/images/inventory/care/play-tunnel-action-object-icon.png'),
  'feed-action-object': require('../../../assets/images/icons/actions/feed-action-object-icon.png'),
  'play-action-object': require('../../../assets/images/icons/actions/play-action-object-icon.png'),
};

export function getItemImage(itemId: string): ImageSourcePropType | undefined {
  return itemImagesByCode[itemId as ItemCode];
}
