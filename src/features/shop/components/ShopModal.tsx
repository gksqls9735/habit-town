import { useRef, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { shopItems, type ShopCategory, type ShopItem } from '../items';

type ShopModalProps = {
  coinBalance: number;
  onClose: () => void;
  onPurchase: (item: ShopItem) => Promise<boolean>;
  ownedItemIds: readonly string[];
  visible: boolean;
};

const fontFamily = 'Galmuri11';
const filters: { id: ShopCategory; label: string }[] = [
  { id: 'object', label: '오브젝트' },
  { id: 'wallpaper', label: '벽지' },
  { id: 'flooring', label: '바닥재' },
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
    if (ownedItemIds.includes(item.id) || purchaseInFlight.current) return;

    purchaseInFlight.current = true;
    setIsPurchasingId(item.id);
    const purchased = await onPurchase(item);
    purchaseInFlight.current = false;
    setIsPurchasingId(null);

    if (!purchased) {
      setMessage('코인이 조금 부족해요. 할 일을 완료해 코인을 모아보세요!');
      return;
    }
    setMessage(`${item.name} 구매 완료! 가방에 담았어요.`);
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.layer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="상점 닫기" onPress={onClose} style={styles.backdrop} />
        <View style={{ width: panelWidth, maxHeight: height - insets.top - insets.bottom - 32 }}>
          <View pointerEvents="none" style={styles.pixelShadow} />
          <View accessibilityViewIsModal style={styles.panel}>
            <View style={styles.header}>
              <Image source={require('../../../../assets/ui/shop-button.png')} resizeMode="contain" style={styles.shopIcon} />
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>ROOM SHOP</Text>
                <Text accessibilityRole="header" style={styles.title}>꾸미기 상점</Text>
              </View>
              <View style={styles.balance}><Text style={styles.coin}>◆</Text><Text style={styles.balanceText}>{coinBalance.toLocaleString()}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel="상점 팝업 닫기" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
                <Text style={styles.closeText}>×</Text>
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
                const owned = ownedItemIds.includes(item.id);
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
                      <Text style={[styles.buyText, insufficient && !owned && styles.lowBalanceText]}>{owned ? '보유 중' : isPurchasing ? '담는 중' : `◆ ${item.price}`}</Text>
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
  backdrop: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(43, 32, 28, 0.48)' },
  pixelShadow: { position: 'absolute', top: 4, bottom: -4, left: 4, right: -4, backgroundColor: '#493b32' },
  panel: { flexShrink: 1, borderWidth: 2, borderColor: '#3d2d28', backgroundColor: '#fff8ec' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10, gap: 7, borderBottomWidth: 3, borderColor: '#d9bf9c', backgroundColor: '#f0dfc6' },
  shopIcon: { width: 40, height: 40 }, heading: { flex: 1 },
  eyebrow: { fontFamily, fontSize: 9, letterSpacing: 1, color: '#80634c', marginBottom: 4 }, title: { fontFamily, fontSize: 16, color: '#49372d' },
  balance: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderWidth: 2, borderColor: '#b39370', backgroundColor: '#fff8ec' },
  coin: { color: '#d88a3d', fontSize: 12 }, balanceText: { fontFamily, fontSize: 10, color: '#604832' },
  close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff8ec', borderWidth: 2, borderColor: '#98785c', borderBottomWidth: 4 },
  closeText: { fontFamily, fontSize: 25, color: '#644832' },
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
  messageBox: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 14, borderTopWidth: 2, borderColor: '#e4cfb1', backgroundColor: '#fffaf1' }, message: { fontFamily, fontSize: 10, lineHeight: 17, textAlign: 'center', color: '#715944' },
  pressed: { opacity: 0.7 },
});
