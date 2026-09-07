import type { ImageSourcePropType } from 'react-native';

export type ShopCategory = 'object' | 'wallpaper' | 'flooring';

export type ShopItem = {
  category: ShopCategory;
  description: string;
  id: string;
  image: ImageSourcePropType;
  name: string;
  price: number;
};

export const shopItems: ShopItem[] = [
  { id: 'pet-rug', name: '포근한 러그', category: 'object', price: 320, description: '방 한가운데 포근한 자리를 만들어 줘요.', image: require('../../../assets/png/objects/pet-rug.png') },
  { id: 'toy-ball', name: '장난감 공', category: 'object', price: 180, description: '친구와 함께 데굴데굴 놀 수 있어요.', image: require('../../../assets/png/objects/toy-ball.png') },
  { id: 'pet-cushion', name: '푹신한 쿠션', category: 'object', price: 280, description: '낮잠 시간을 더 편안하게 만들어 줘요.', image: require('../../../assets/png/objects/pet-cushion.png') },
  { id: 'pet-food-bowl', name: '밥그릇', category: 'object', price: 220, description: '친구의 맛있는 한 끼를 담는 그릇이에요.', image: require('../../../assets/png/objects/pet-food-bowl.png') },
  { id: 'wall-clock', name: '벽시계', category: 'object', price: 360, description: '빈 벽에 귀여운 포인트를 더해 줘요.', image: require('../../../assets/png/objects/wall-clock.png') },
  { id: 'ivory-wallpaper', name: '아이보리 벽지', category: 'wallpaper', price: 540, description: '어떤 친구와도 어울리는 밝고 포근한 벽지예요.', image: require('../../../assets/png/backgrounds/basic-room-wallpaper.png') },
  { id: 'cacao-flooring', name: '카카오 바닥재', category: 'flooring', price: 620, description: '정돈된 나무 무늬가 살아 있는 따뜻한 바닥재예요.', image: require('../../../assets/png/backgrounds/basic-room-floor.png') },
];
