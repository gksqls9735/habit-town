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
  'low-bookshelf': require('../../../assets/png/objects/low-bookshelf.png'),
  'sprout-wall-art': require('../../../assets/png/objects/sprout-wall-art.png'),
  'toy-storage-basket': require('../../../assets/png/objects/toy-storage-basket.png'),
  'ivory-wallpaper': require('../../../assets/png/backgrounds/basic-room-wallpaper.png'),
  'cacao-flooring': require('../../../assets/png/backgrounds/basic-room-floor.png'),
  'sage-ivory-wallpaper': require('../../../assets/png/backgrounds/sage-ivory-wallpaper.png'),
  'powder-blue-wallpaper': require('../../../assets/png/backgrounds/powder-blue-wallpaper.png'),
  'dark-walnut-flooring': require('../../../assets/png/backgrounds/dark-walnut-flooring.png'),
  'white-oak-flooring': require('../../../assets/png/backgrounds/white-oak-flooring.png'),
};

export function getItemImage(itemId: string): ImageSourcePropType | undefined {
  return itemImagesByCode[itemId as ItemCode];
}
