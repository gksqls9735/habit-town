export type DeliveryEventReason = 'growth' | 'manual';

const deliveryMessagesByReason: Record<DeliveryEventReason, readonly string[]> = {
  growth: [
    '잘 키워줘서 감사합니다. 앞으로도 따뜻하게 보살펴 주세요.',
    '축하드립니다! 아이가 한 단계 더 자랐어요.',
    '정성스러운 돌봄이 전해졌어요. 작은 선물을 보내드려요.',
    '매일의 노력이 아이를 자라게 했어요. 정말 고마워요.',
    '더 씩씩해진 모습이 보기 좋아요. 앞으로도 잘 부탁드려요.',
    '성장을 축하드립니다. 오늘도 다정한 하루를 만들어 주세요.',
    '꾸준히 함께해 주셔서 감사합니다. 아이가 무럭무럭 자라고 있어요.',
    '새로운 성장 단계에 도착했어요. 기념 선물을 받아 주세요.',
  ],
  manual: [
    '동물보호협회에서 작은 감사 선물을 보냈어요.',
    '따뜻한 마음을 담은 택배가 도착했어요.',
    '오늘의 선물이 도착했어요. 열어서 확인해 보세요.',
    '보호소 친구들이 감사 인사를 담아 보냈어요.',
  ],
};

export function drawDeliveryMessage(reason: DeliveryEventReason) {
  const messages = deliveryMessagesByReason[reason];
  const index = Math.floor(Math.random() * messages.length);

  return messages[index];
}
