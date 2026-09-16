import { PetDefinition, RailAction } from './types';

export const leftActions: RailAction[] = [
  {
    id: 'todayTasks',
    image: require('../../../assets/ui/today-tasks-button-simple.png'),
    label: 'Today',
    symbol: '!',
  },
  {
    id: 'yearlyGoal',
    image: require('../../../assets/ui/yearly-goals-button-simple.png'),
    label: 'Goal',
    symbol: 'Y',
  },
  {
    id: 'calendar',
    image: require('../../../assets/ui/calendar-button-simple.png'),
    label: 'Calendar',
    symbol: 'C',
  },
  {
    id: 'shop',
    image: require('../../../assets/ui/shop-button.png'),
    label: 'Shop',
    symbol: '$',
  },
];

export const rightActions: RailAction[] = [
  { id: 'gift', image: require('../../../assets/ui/reward-button.png'), label: 'Gift', symbol: 'G' },
  { id: 'inventory', image: require('../../../assets/ui/inventory-button.png'), label: 'Bag', symbol: 'I' },
];

export const pets: PetDefinition[] = [
  {
    id: 'cat',
    name: 'Cat',
    roomName: "Cat's Room",
    stages: {
      adult: require('../../../assets/png/animals/cat-adult.png'),
      baby: require('../../../assets/png/animals/cat-baby.png'),
      child: require('../../../assets/png/animals/cat-child.png'),
      teen: require('../../../assets/png/animals/cat-teen.png'),
    },
  },
  {
    id: 'hamster',
    name: 'Hamster',
    roomName: "Hamster's Room",
    stages: {
      adult: require('../../../assets/png/animals/hamster-adult.png'),
      baby: require('../../../assets/png/animals/hamster-baby.png'),
      child: require('../../../assets/png/animals/hamster-child.png'),
      teen: require('../../../assets/png/animals/hamster-teen.png'),
    },
  },
  {
    id: 'dog',
    name: 'Dog',
    roomName: "Dog's Room",
    stages: {
      adult: require('../../../assets/png/animals/dog-adult.png'),
      baby: require('../../../assets/png/animals/dog-baby.png'),
      child: require('../../../assets/png/animals/dog-child.png'),
      teen: require('../../../assets/png/animals/dog-teen.png'),
    },
  },
];
