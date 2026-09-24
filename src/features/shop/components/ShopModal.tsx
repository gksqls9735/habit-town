import { useEffect, useRef, useState } from 'react';
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
import { PopupCloseButton } from '../../../components/common/PopupCloseButton';
import { useI18n } from '../../i18n';
import { getLocalizedItemDescription, getLocalizedItemName } from '../../items/localizedItems';
import type { InventoryCapacityCategory } from '../../inventory/types';
import { shopItems, type ShopCategory, type ShopItem } from '../items';

type ShopModalProps = {
  coinBalance: number;
  getItemPrice?: (item: ShopItem) => number;
  isItemSoldOut?: (item: ShopItem) => boolean;
  onClose: () => void;
  onPurchase: (item: ShopItem) => Promise<boolean>;
  ownedItemIds: readonly string[];
  visible: boolean;
};

const fontFamily = 'Galmuri11';
const currencyCoinIcon = require('../../../../assets/images/rewards/gromi-coin.png');
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;
const filters: { id: ShopCategory; label: string }[] = [
  { id: 'object', label: 'shop.category.object' },
  { id: 'action', label: 'shop.category.action' },
  { id: 'wallpaper', label: 'shop.category.wallpaper' },
  { id: 'flooring', label: 'shop.category.flooring' },
  { id: 'misc', label: 'shop.category.misc' },
];

export function ShopModal({
  coinBalance,
  getItemPrice = (item) => item.price,
  isItemSoldOut = () => false,
  onClose,
  onPurchase,
  ownedItemIds,
  visible,
}: ShopModalProps) {
  const { t } = useI18n();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ShopCategory>('object');
  const [isPurchasingId, setIsPurchasingId] = useState<string | null>(null);
  const [message, setMessage] = useState(t('shop.defaultMessage'));
  const purchaseInFlight = useRef(false);
  const panelWidth = Math.min(width - 32, 520);
  const items = shopItems.filter((item) => item.category === category);

  useEffect(() => {
    if (visible) {
      setMessage(t('shop.defaultMessage'));
    }
  }, [t, visible]);

  const buy = async (item: ShopItem) => {
    if (isOwnedShopItem(item, ownedItemIds) || isItemSoldOut(item) || purchaseInFlight.current) return;

    purchaseInFlight.current = true;
    setIsPurchasingId(item.id);
    const purchased = await onPurchase(item);
    purchaseInFlight.current = false;
    setIsPurchasingId(null);

    if (!purchased) {
      setMessage(t('shop.insufficientCoins'));
      return;
    }
    setMessage(item.kind === 'goal-capacity'
      ? t('shop.goalCapacityPurchased', { count: item.slotIncrease })
      : item.kind === 'inventory-capacity'
        ? t('shop.capacityPurchased', {
          capacity: getCapacityLabel(item.capacityCategory, t),
          count: item.slotIncrease,
        })
        : t('shop.itemPurchased', { item: getLocalizedItemName(item, t) }));
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={[styles.layer, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('shop.close')} onPress={onClose} style={styles.backdrop} />
        <View style={{ width: panelWidth, maxHeight: height - insets.top - insets.bottom - 32 }}>
          <View accessibilityViewIsModal style={styles.panel}>
            <View style={styles.header}>
              <Image source={require('../../../../assets/images/icons/navigation/shop-button.png')} resizeMode="contain" style={styles.shopIcon} />
              <View style={styles.heading}>
                <Text style={styles.eyebrow}>ROOM SHOP</Text>
                <Text accessibilityRole="header" style={styles.title}>{t('shop.title')}</Text>
              </View>
              <View style={styles.balance}>
                <Image accessibilityIgnoresInvertColors source={currencyCoinIcon} resizeMode="contain" style={[styles.coinIcon, pixelatedImageStyle]} />
                <Text style={styles.balanceText}>{coinBalance.toLocaleString()}</Text>
              </View>
              <PopupCloseButton accessibilityLabel={t('shop.close')} onPress={onClose} />
            </View>
            <View style={styles.filters}>
              {filters.map((filter) => (
                <Pressable key={filter.id} accessibilityRole="button" accessibilityState={{ selected: category === filter.id }}
                  onPress={() => {
                    setCategory(filter.id);
                    setMessage(t('shop.browse', { category: t(filter.label) }));
                  }}
                  style={({ pressed }) => [styles.filter, category === filter.id && styles.activeFilter, pressed && styles.pressed]}>
                  <Text style={[styles.filterText, category === filter.id && styles.activeFilterText]}>{t(filter.label)}</Text>
                </Pressable>
              ))}
            </View>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.products}>
              {items.map((item) => {
                const owned = isOwnedShopItem(item, ownedItemIds) || isItemSoldOut(item);
                const itemPrice = getItemPrice(item);
                const insufficient = coinBalance < itemPrice;
                const isPurchasing = isPurchasingId === item.id;
                return (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.preview}><Image accessibilityIgnoresInvertColors source={item.image} resizeMode="contain" style={styles.previewImage} /></View>
                    <View style={styles.cardCopy}>
                      <Text style={styles.itemName}>{getLocalizedItemName(item, t)}</Text>
                      <Text numberOfLines={2} style={styles.description}>{getLocalizedItemDescription(item, t)}</Text>
                      {item.kind === 'inventory-item' && item.careEffect ? (
                        <Text style={styles.careEffectText}>{getCareEffectLabel(item.careEffect, t)}</Text>
                      ) : null}
                    </View>
                    <Pressable accessibilityRole="button" disabled={owned || isPurchasingId !== null} onPress={() => void buy(item)}
                      style={({ pressed }) => [styles.buyButton, owned && styles.ownedButton, insufficient && !owned && styles.lowBalanceButton, pressed && styles.pressed]}>
                      {owned || isPurchasing ? (
                        <Text style={[styles.buyText, insufficient && !owned && styles.lowBalanceText]}>
                          {owned ? t('shop.owned') : t('shop.purchasing')}
                        </Text>
                      ) : (
                        <View style={styles.priceRow}>
                          <Image accessibilityIgnoresInvertColors source={currencyCoinIcon} resizeMode="contain" style={[styles.priceCoinIcon, pixelatedImageStyle]} />
                          <Text style={[styles.buyText, insufficient && styles.lowBalanceText]}>{itemPrice}</Text>
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
  coinIcon: { height: 26, width: 26 }, balanceText: { fontFamily, fontSize: 10, color: '#604832' },
  close: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffd99e', borderWidth: 2, borderColor: '#6b432f' },
  closeText: { fontFamily, fontSize: 20, color: '#5c3529' },
  filters: { flexDirection: 'row', gap: 6, padding: 14, borderBottomWidth: 2, borderColor: '#e4cfb1' },
  filter: { flex: 1, minHeight: 44, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#d8c4a9', backgroundColor: '#f8eddd' },
  activeFilter: { borderColor: '#705340', backgroundColor: '#705340' }, filterText: { fontFamily, fontSize: 9, color: '#745c47' }, activeFilterText: { color: '#fff8ec' },
  scroll: { flexShrink: 1 }, products: { padding: 14, gap: 10 },
  card: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 7, padding: 7, borderWidth: 2, borderColor: '#aa8664', backgroundColor: '#f0dfc2' },
  preview: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff7e4', overflow: 'hidden' }, previewImage: { width: '92%', height: '92%' },
  cardCopy: { flex: 1, gap: 4 }, itemName: { fontFamily, fontSize: 12, lineHeight: 18, color: '#49372d' }, description: { fontFamily, fontSize: 10, lineHeight: 15, color: '#79624d' },
  careEffectText: { alignSelf: 'flex-start', backgroundColor: '#fff5dc', borderColor: '#c59f72', borderWidth: 1, color: '#6b4e38', fontFamily, fontSize: 9, lineHeight: 14, paddingHorizontal: 5, paddingVertical: 2 },
  buyButton: { minWidth: 64, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6, borderWidth: 2, borderColor: '#705340', borderBottomWidth: 4, backgroundColor: '#8a684f' },
  ownedButton: { backgroundColor: '#a99b84', borderColor: '#817663' }, lowBalanceButton: { backgroundColor: '#e8d8c0', borderColor: '#c4ad90' },
  buyText: { fontFamily, fontSize: 10, color: '#fffaf0' }, lowBalanceText: { color: '#947c64' },
  priceCoinIcon: { height: 22, width: 22 },
  priceRow: { alignItems: 'center', flexDirection: 'row', gap: 3 },
  messageBox: { minHeight: 52, justifyContent: 'center', paddingHorizontal: 14, borderTopWidth: 2, borderColor: '#e4cfb1', backgroundColor: '#fffaf1' }, message: { fontFamily, fontSize: 10, lineHeight: 17, textAlign: 'center', color: '#715944' },
  pressed: { opacity: 0.7 },
});

function isOwnedShopItem(item: ShopItem, ownedItemIds: readonly string[]): boolean {
  return item.kind === 'inventory-item' && item.category !== 'action' && ownedItemIds.includes(item.id);
}

function getCapacityLabel(category: InventoryCapacityCategory, t: (key: string) => string) {
  return category === 'decor' ? t('shop.capacityDecor') : t('shop.capacityGeneral');
}

function getCareEffectLabel(
  effect: { increase: number; meter: 'cleanliness' | 'hunger' | 'loneliness' },
  t: (key: string, params?: Record<string, number | string>) => string,
) {
  return t('care.effect', {
    meter: t(`care.meter.${effect.meter}`),
    percent: Math.round(effect.increase * 100),
  });
}
