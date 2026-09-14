import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageStyle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { InventoryItem } from '../../../features/inventory/types';
import { getItemImage } from '../../../features/items/itemImages';
import type { CareMeterKey } from '../../../features/rewards/rewardSystem';

export type CareUsableItem = InventoryItem & {
  careEffect: {
    increase: number;
    meter: CareMeterKey;
  };
};

type CareItemUsePopupProps = {
  errorMessage: string;
  isBusy: boolean;
  items: CareUsableItem[];
  meter: CareMeterKey | null;
  onClose: () => void;
  onUseItem: (item: CareUsableItem, quantity: number) => void;
  visible: boolean;
  width: number;
};

const fontFamily = 'Galmuri11';
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

export function CareItemUsePopup({
  errorMessage,
  isBusy,
  items,
  meter,
  onClose,
  onUseItem,
  visible,
  width,
}: CareItemUsePopupProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? items[0] ?? null,
    [items, selectedItemId],
  );

  useEffect(() => {
    if (!visible) return;

    setSelectedItemId((current) =>
      current && items.some((item) => item.id === current) ? current : items[0]?.id ?? null,
    );
    setQuantity(1);
  }, [items, visible]);

  useEffect(() => {
    if (!selectedItem) {
      setQuantity(1);
      return;
    }

    setQuantity((current) => Math.min(Math.max(1, current), selectedItem.quantity));
  }, [selectedItem]);

  if (!visible || !meter) {
    return null;
  }

  const hasItems = items.length > 0;
  const totalIncrease = selectedItem ? selectedItem.careEffect.increase * quantity : 0;
  const canUse = Boolean(selectedItem) && !isBusy;

  return (
    <View style={styles.layer}>
      <Pressable
        accessibilityLabel="돌봄 아이템 사용 닫기"
        accessibilityRole="button"
        onPress={onClose}
        style={styles.backdrop}
      />
      <View accessibilityViewIsModal style={[styles.panel, { width }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>CARE ITEMS</Text>
            <Text accessibilityRole="header" style={styles.title}>
              {getMeterActionTitle(meter)}
            </Text>
          </View>
          <Pressable
            accessibilityLabel="돌봄 아이템 팝업 닫기"
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
          >
            <Text style={styles.closeText}>x</Text>
          </Pressable>
        </View>

        {hasItems ? (
          <>
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
              {items.map((item) => {
                const selected = selectedItem?.id === item.id;

                return (
                  <Pressable
                    accessibilityLabel={`${item.name}, ${item.quantity}개, ${getCareEffectLabel(item.careEffect)}`}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    key={item.id}
                    onPress={() => {
                      setSelectedItemId(item.id);
                      setQuantity(1);
                    }}
                    style={({ pressed }) => [
                      styles.itemRow,
                      selected && styles.itemRowSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.preview}>
                      <CareItemImage item={item} />
                    </View>
                    <View style={styles.itemCopy}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text numberOfLines={2} style={styles.itemDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.effectText}>{getCareEffectLabel(item.careEffect)}</Text>
                    </View>
                    <View style={styles.quantityBadge}>
                      <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.usePanel}>
              <View style={styles.stepper}>
                <Pressable
                  accessibilityLabel="사용 수량 줄이기"
                  accessibilityRole="button"
                  disabled={!selectedItem || quantity <= 1 || isBusy}
                  onPress={() => setQuantity((current) => Math.max(1, current - 1))}
                  style={({ pressed }) => [
                    styles.stepButton,
                    (!selectedItem || quantity <= 1 || isBusy) && styles.stepButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.stepButtonText}>-</Text>
                </Pressable>
                <View style={styles.quantityBox}>
                  <Text style={styles.quantityText}>{quantity}</Text>
                </View>
                <Pressable
                  accessibilityLabel="사용 수량 늘리기"
                  accessibilityRole="button"
                  disabled={!selectedItem || quantity >= selectedItem.quantity || isBusy}
                  onPress={() => setQuantity((current) =>
                    selectedItem ? Math.min(selectedItem.quantity, current + 1) : current,
                  )}
                  style={({ pressed }) => [
                    styles.stepButton,
                    (!selectedItem || quantity >= selectedItem.quantity || isBusy) && styles.stepButtonDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.stepButtonText}>+</Text>
                </Pressable>
              </View>
              <Text style={styles.totalText}>{getMeterLabel(meter)} +{Math.round(totalIncrease * 100)}%</Text>
              <Pressable
                accessibilityLabel="돌봄 아이템 사용하기"
                accessibilityRole="button"
                disabled={!canUse}
                onPress={() => {
                  if (!selectedItem) return;
                  onUseItem(selectedItem, quantity);
                }}
                style={({ pressed }) => [
                  styles.useButton,
                  !canUse && styles.useButtonDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.useButtonText}>{isBusy ? '사용 중' : '사용하기'}</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{getMeterLabel(meter)}을 채울 아이템이 없어요.</Text>
            <Text style={styles.emptySubText}>상점의 돌봄 탭에서 아이템을 구매해 주세요.</Text>
          </View>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </View>
    </View>
  );
}

function CareItemImage({ item }: { item: InventoryItem }) {
  const image = getItemImage(item.id);

  if (image) {
    return (
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={image}
        style={[styles.previewImage, pixelatedImageStyle]}
      />
    );
  }

  return <Text style={styles.fallbackSymbol}>{item.symbol}</Text>;
}

function getCareEffectLabel(effect: CareUsableItem['careEffect']) {
  return `${getMeterLabel(effect.meter)} +${Math.round(effect.increase * 100)}%`;
}

function getMeterActionTitle(meter: CareMeterKey) {
  if (meter === 'cleanliness') return '청소 아이템';
  if (meter === 'hunger') return '밥 아이템';
  return '놀이 아이템';
}

function getMeterLabel(meter: CareMeterKey) {
  if (meter === 'cleanliness') return '청결도';
  if (meter === 'hunger') return '포만감';
  return '친밀도';
}

const styles = StyleSheet.create({
  layer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  backdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.58)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  panel: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    maxHeight: '78%',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    borderBottomColor: '#e4cfb1',
    borderBottomWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  eyebrow: {
    color: '#80634c',
    fontFamily,
    fontSize: 9,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    color: '#49372d',
    fontFamily,
    fontSize: 16,
  },
  close: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  closeText: {
    color: '#5c3529',
    fontFamily,
    fontSize: 20,
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    gap: 8,
    padding: 12,
  },
  itemRow: {
    alignItems: 'center',
    backgroundColor: '#f0dfc2',
    borderBottomColor: '#fffdf4',
    borderLeftColor: '#aa8664',
    borderRightColor: '#fffdf4',
    borderTopColor: '#aa8664',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    minHeight: 88,
    padding: 7,
  },
  itemRowSelected: {
    backgroundColor: '#ead2a7',
    borderBottomColor: '#6f513b',
    borderRightColor: '#6f513b',
  },
  preview: {
    alignItems: 'center',
    backgroundColor: '#fff7e4',
    height: 54,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 54,
  },
  previewImage: {
    height: '92%',
    width: '92%',
  },
  fallbackSymbol: {
    color: '#49372d',
    fontFamily,
    fontSize: 18,
  },
  itemCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  itemName: {
    color: '#49372d',
    fontFamily,
    fontSize: 12,
    lineHeight: 18,
  },
  itemDescription: {
    color: '#79624d',
    fontFamily,
    fontSize: 9,
    lineHeight: 14,
  },
  effectText: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff5dc',
    borderColor: '#c59f72',
    borderWidth: 1,
    color: '#6b4e38',
    fontFamily,
    fontSize: 9,
    lineHeight: 14,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  quantityBadge: {
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderColor: '#b39370',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 36,
  },
  quantityBadgeText: {
    color: '#604832',
    fontFamily,
    fontSize: 10,
  },
  usePanel: {
    alignItems: 'center',
    backgroundColor: '#fffaf1',
    borderTopColor: '#e4cfb1',
    borderTopWidth: 2,
    gap: 9,
    padding: 12,
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: '#f3d7a8',
    borderColor: '#8c603e',
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    width: 42,
  },
  stepButtonDisabled: {
    opacity: 0.45,
  },
  stepButtonText: {
    color: '#654333',
    fontFamily,
    fontSize: 16,
  },
  quantityBox: {
    alignItems: 'center',
    backgroundColor: '#fff8ec',
    borderColor: '#b39370',
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    minWidth: 48,
    paddingHorizontal: 8,
  },
  quantityText: {
    color: '#604832',
    fontFamily,
    fontSize: 12,
  },
  totalText: {
    color: '#715944',
    fontFamily,
    fontSize: 10,
  },
  useButton: {
    alignItems: 'center',
    backgroundColor: '#8a684f',
    borderBottomWidth: 4,
    borderColor: '#705340',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 126,
    paddingHorizontal: 12,
  },
  useButtonDisabled: {
    backgroundColor: '#a99b84',
    borderColor: '#817663',
  },
  useButtonText: {
    color: '#fffaf0',
    fontFamily,
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    minHeight: 150,
    justifyContent: 'center',
    padding: 18,
  },
  emptyText: {
    color: '#49372d',
    fontFamily,
    fontSize: 12,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#79624d',
    fontFamily,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  errorText: {
    color: '#a34c39',
    fontFamily,
    fontSize: 10,
    lineHeight: 16,
    paddingBottom: 10,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
