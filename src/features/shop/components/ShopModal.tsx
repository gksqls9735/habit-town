import { useRef, useState } from 'react';
import {
  Image,
  ImageStyle,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { InventoryCapacityCategory } from '../../inventory/types';
import { shopItems, type ShopCategory, type ShopItem } from '../items';

type ShopModalProps = {
  coinBalance: number;
  onClose: () => void;
  onPurchase: (item: ShopItem) => Promise<boolean>;
  ownedItemIds: readonly string[];
  visible: boolean;
};

const fontFamily = 'Galmuri11';
const currencyCoinIcon = require('../../../../assets/ui/currency-coin.png');
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;
const filters: { id: ShopCategory; label: string }[] = [
  { id: 'object', label: '가구/소품' },
  { id: 'wallpaper', label: '벽지' },
  { id: 'flooring', label: '바닥재' },
  { id: 'misc', label: '기타' },
];

export function ShopModal({ coinBalance, onClose, onPurchase, ownedItemIds, visible }: ShopModalProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ShopCategory>('object');
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState('마음에 드는 방 꾸미기 아이템을 골라보세요.');
  const purchaseInFlight = useRef(false);
  const panelWidth = Math.min(width - 32, 520);
  const items = shopItems.filter((item) => item.category === category);

  const buy = async (item: ShopItem) => {
    if (isOwnedShopItem(item, ownedItemIds) || purchaseInFlight.current) return;

    purchaseInFlight.current = true;
    setIsPurchasingId(item.id);
    const purchased = await onPurchase(item);
    purchaseInFlight.current = false;
    setIsPurchasingId(null);

    if (!purchased) {
      setMessage('코인이 조금 부족해요. 할 일을 완료해 코인을 모아보세요!');
      return;
    }
    setMessage(item.kind === 'inventory-capacity'
      ? `${getCapacityLabel(item.capacityCategory)}이 ${item.slotIncrease}칸 넓어졌어요.`
      : `${item.name} 구매 완료! 가방에 담았어요.`);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.layer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="상점 닫기" onPress={onClose} style={styles.backdrop} />
        <View style={{ width: panelWidth, maxHeight: height - insets.top - insets.bottom - 32 }}>
          <View accessibilityViewIsModal style={styles.panel}>
            <View style={styles.header}>
              <Image source={require('../../../../assets/ui/shop-button.png')} resizeMode="contain" style={styles.shopIcon} />
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>ROOM SHOP</Text>
                <Text accessibilityRole="header" style={styles.title}>꾸미기 상점</Text>
              </View>
              <View style={styles.balance}>
                <Image accessibilityIgnoresInvertColors source={currencyCoinIcon} resizeMode="contain" style={[styles.coinIcon, pixelatedImageStyle]} />
                <Text style={styles.balanceText}>{coinBalance.toLocaleString()}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="상점 팝업 닫기" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>
            <View style={styles.filters}>
              {filters.map((filter) => (
                <Pressable key={filter.id} accessibilityRole="button" accessibilityState={{ selected: category === filter.id }}
                  onPress={() => { setCategory(filter.id); setMessage(`${filter.label} 상품을 둘러보세요.`); }}
                  style={({ pressed }) => [styles.filter, category === filter.id && styles.activeFilter, pressed && styles.pressed]}>
                  <Text style={[styles.filterText, category === filter.id && styles.activeFilterText]}>{filter.label}</Text>
                </Pressable>
              ))}
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.products}>
              {items.map((item) => {
                const owned = isOwnedShopItem(item, ownedItemIds);
                const insufficient = coinBalance < item.price;
                const isPurchasing = isPurchasingId === item.id;
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.preview}><Image accessibilityIgnoresInvertColors source={item.image} resizeMode="contain" style={styles.previewImage} /></View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
                    </View>
                    <Pressable accessibilityRole="button" disabled={owned || isPurchasingId !== null} onPress={() => void buy(item)}
                      style={({ pressed }) => [styles.buyButton, owned && styles.ownedButton, insufficient && !owned && styles.lowBalanceButton, pressed && styles.pressed]}>
                      {owned || isPurchasing ? (
                        <Text style={[styles.buyText, insufficient && !owned && styles.lowBalanceText]}>
                          {owned ? '보유 중' : '담는 중'}
                        </Text>
                      ) : (
                        <View style={styles.priceRow}>
                          <Image accessibilityIgnoresInvertColors source={currencyCoinIcon} resizeMode="contain" style={[styles.priceCoinIcon, pixelatedImageStyle]} />
                          <Text style={[styles.buyText, insufficient && styles.lowBalanceText]}>{item.price}</Text>
                        </View>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.messageBox}><Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  layer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(49, 42, 35, 0.58)' },
  panel: { flexShrink: 1, borderWidth: 2, borderColor: '#3d2d28', backgroundColor: '#fff8ea' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 7, backgroundColor: '#fff8ea' },
  shopIcon: { width: 40, height: 40 }, heading: { flex: 1 },
  eyebrow: { fontFamily, fontSize: 9, letterSpacing: 1, color: '#80634c', marginBottom: 4 }, title: { fontFamily, fontSize: 16, color: '#49372d' },
  balance: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderWidth: 2, borderColor: '#b39370', backgroundColor: '#fff8ec' },
  coinIcon: { height: 16, width: 16 }, balanceText: { fontFamily, fontSize: 10, color: '#604832' },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffd99e', borderWidth: 2, borderColor: '#6b432f' },
  closeText: { fontFamily, fontSize: 20, color: '#5c3529' },
  filters: { flexDirection: 'row', gap: 6, padding: 14, borderBottomWidth: 2, borderColor: '#e4cfb1' },
  filter: { flex: 1, minHeight: 44, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#d8c4a9', backgroundColor: '#f8eddd' },
  activeFilter: { borderColor: '#705340', backgroundColor: '#705340' }, filterText: { fontFamily, fontSize: 10, color: '#745c47' }, activeFilterText: { color: '#fff8ec' },
  scroll: { flexShrink: 1 }, products: { padding: 14, gap: 10 },
  card: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 7, padding: 7, borderWidth: 2, borderTopColor: '#aa8664', borderLeftColor: '#aa8664', borderRightColor: '#fffdf4', borderBottomColor: '#fffdf4', backgroundColor: '#f0dfc2' },
  preview: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff7e4', overflow: 'hidden' }, previewImage: { width: '92%', height: '92%' },
  cardCopy: { flex: 1, gap: 5 }, itemName: { fontFamily, fontSize: 12, lineHeight: 18, color: '#49372d' }, description: { fontFamily, fontSize: 10, lineHeight: 16, color: '#79624d' },
  buyButton: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2, borderColor: '#705340', borderBottomWidth: 4, backgroundColor: '#8a684f' },
  ownedButton: { backgroundColor: '#a99b84', borderColor: '#817663' }, lowBalanceButton: { backgroundColor: '#e8d8c0', borderColor: '#c4ad90' },
  buyText: { fontFamily, fontSize: 10, color: '#fffaf0' }, lowBalanceText: { color: '#947c64' },
  priceCoinIcon: { height: 15, width: 15 },
  priceRow: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  messageBox: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 14, borderTopWidth: 2, borderColor: '#e4cfb1', backgroundColor: '#fffaf1' }, message: { fontFamily, fontSize: 10, lineHeight: 17, textAlign: 'center', color: '#715944' },
  pressed: { opacity: 0.7 },
});

function isOwnedShopItem(item: ShopItem, ownedItemIds: readonly string[]): boolean {
  return item.kind === 'inventory-item' && ownedItemIds.includes(item.id);
}

function getCapacityLabel(category: InventoryCapacityCategory) {
  return category === 'decor' ? '꾸미기 가방' : '가방';
}
