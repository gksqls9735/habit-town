import { PetDefinition, RailAction } from './types';

export const leftActions: RailAction[] = [
  {
    image: require('../../../assets/ui/today-tasks-button.png'),
    label: '오늘 할일',
    symbol: '!',
  },
  {
    image: require('../../../assets/ui/yearly-goals-button-v2.png'),
    label: '올해 목표',
    symbol: 'Y',
  },
  {
    image: require('../../../assets/ui/calendar-button.png'),
    label: '캘린더',
    symbol: 'C',
  },
  {
    image: require('../../../assets/ui/shop-button.png'),
    label: '상점',
    symbol: '$',
  },
];

export const rightActions: RailAction[] = [
  { image: require('../../../assets/ui/reward-button.png'), label: '보상', symbol: 'G' },
  { image: require('../../../assets/ui/inventory-button.png'), label: '가방', symbol: 'I' },
];

export const pets: PetDefinition[] = [
  {
    id: 'cat',
    name: '고양이',
    roomName: '고양이 방',
    stages: {
      adult: require('../../../assets/pets/cat-adult.png'),
      baby: require('../../../assets/pets/cat-baby.png'),
      child: require('../../../assets/pets/cat-child.png'),
      teen: require('../../../assets/pets/cat-teen.png'),
    },
  },
  {
    id: 'hamster',
    name: '햄스터',
    roomName: '햄스터 방',
    stages: {
      adult: require('../../../assets/pets/hamster-adult.png'),
      baby: require('../../../assets/pets/hamster-baby.png'),
      child: require('../../../assets/pets/hamster-child.png'),
      teen: require('../../../assets/pets/hamster-teen.png'),
    },
  },
  {
    id: 'dog',
    name: '강아지',
    roomName: '강아지 방',
    stages: {
      adult: require('../../../assets/pets/dog-adult.png'),
      baby: require('../../../assets/pets/dog-baby.png'),
      child: require('../../../assets/pets/dog-child.png'),
      teen: require('../../../assets/pets/dog-teen.png'),
    },
  },
];
