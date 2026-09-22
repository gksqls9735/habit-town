export type DeliveryEventReason = 'growth' | 'hourly' | 'manual';

const deliveryMessagesByReason: Record<DeliveryEventReason, readonly string[]> = {
  growth: [
    'delivery.message.growth.0',
    'delivery.message.growth.1',
    'delivery.message.growth.2',
    'delivery.message.growth.3',
    'delivery.message.growth.4',
    'delivery.message.growth.5',
    'delivery.message.growth.6',
    'delivery.message.growth.7',
  ],
  manual: [
    'delivery.message.manual.0',
    'delivery.message.manual.1',
    'delivery.message.manual.2',
    'delivery.message.manual.3',
  ],
  hourly: [
    'delivery.message.hourly.0',
    'delivery.message.hourly.1',
    'delivery.message.hourly.2',
    'delivery.message.hourly.3',
  ],
};

export function drawDeliveryMessage(
  reason: DeliveryEventReason,
  t: (key: string, params?: Record<string, number | string>, fallback?: string) => string = (key) => key,
) {
  const messages = deliveryMessagesByReason[reason];
  const index = Math.floor(Math.random() * messages.length);

  return t(messages[index]);
}
