import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { InventoryItem, InventoryItemCategory } from '../types';
import { getItemImage } from '../../items/itemImages';
import { getItemShopCategory } from '../../items/itemCatalog';

const pixelFontFamily = 'Galmuri11';
const slotCount = 24;

type InventorySection = 'general' | 'decor';

const inventorySections: readonly { id: InventorySection; label: string }[] = [
  { id: 'general', label: '일반 아이템' },
  { id: 'decor', label: '꾸미기 아이템' },
];

const categoryColors: Record<InventoryItemCategory, string> = {
  decor: '#9b6bc4',
  material: '#4e9db3',
  'pet-care': '#d56d70',
  tool: '#6b78b8',
};

export function InventoryModal({
  onClose,
  visible,
  width,
}: {
  onClose: () => void;
  visible: boolean;
  width: number;
}) {
  const { deleteItem, errorMessage, isLoading, items, refresh, selectItem, toggleEquipped } =
    useInventory();
  const [activeSection, setActiveSection] = useState<InventorySection>('general');
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const sectionItems = useMemo(
    () => items.filter((item) => getInventorySection(item) === activeSection),
    [activeSection, items],
  );
  const sectionCounts = useMemo(
    () => ({
      decor: items.filter((item) => getInventorySection(item) === 'decor').length,
      general: items.filter((item) => getInventorySection(item) === 'general').length,
    }),
    [items],
  );
  const selectedItem = useMemo(
    () => sectionItems.find((item) => item.id === selectedItemId) ?? null,
    [sectionItems, selectedItemId],
  );
  const pendingDeleteItem = useMemo(
    () => sectionItems.find((item) => item.id === pendingDeleteItemId) ?? null,
    [pendingDeleteItemId, sectionItems],
  );
  const slotSize = Math.max(38, Math.floor((width - 76) / 6));

  useEffect(() => {
    if (visible) {
      void refresh();
    }
  }, [refresh, visible]);

  useEffect(() => {
    if (selectedItemId && sectionItems.some((item) => item.id === selectedItemId)) {
      return;
    }

    setSelectedItemId(sectionItems[0]?.id ?? null);
    setPendingDeleteItemId(null);
  }, [sectionItems, selectedItemId]);

  useEffect(() => {
    if (pendingDeleteItemId && !sectionItems.some((item) => item.id === pendingDeleteItemId)) {
      setPendingDeleteItemId(null);
    }
  }, [pendingDeleteItemId, sectionItems]);

  if (!visible) {
    return null;
  }

  const handleSelectItem = (item: InventoryItem) => {
    setPendingDeleteItemId(null);
    setSelectedItemId(item.id);
    void selectItem(item.id);
  };

  const handleSectionPress = (section: InventorySection) => {
    if (activeSection === section) {
      return;
    }

    const nextItem = items.find((item) => getInventorySection(item) === section);

    setActiveSection(section);
    setPendingDeleteItemId(null);
    setSelectedItemId(nextItem?.id ?? null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem) return;
    const deleted = await deleteItem(pendingDeleteItem.id);
    if (deleted) {
      setPendingDeleteItemId(null);
      setSelectedItemId(null);
    }
  };

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
        <View style={styles.frameShadowRight} />
        <View style={styles.frameShadowBottom} />
        <View style={styles.outerBorder}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <View>
                <Text style={styles.eyebrow}>MY INVENTORY</Text>
                <Text style={styles.title}>가방</Text>
              </View>
              <View style={styles.headerActions}>
                <View style={styles.capacityBadge}>
                  <Text style={styles.capacityText}>
                    {items.length}/{slotCount}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="가방 닫기"
                  accessibilityRole="button"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {isLoading ? (
                <View style={styles.loadingState}>
                  <ActivityIndicator color="#a7552e" />
                  <Text style={styles.loadingText}>가방을 정리하는 중...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.sectionTabs}>
                    {inventorySections.map((section) => {
                      const isActive = activeSection === section.id;

                      return (
                        <Pressable
                          accessibilityRole="tab"
                          accessibilityState={{ selected: isActive }}
                          key={section.id}
                          onPress={() => handleSectionPress(section.id)}
                          style={[
                            styles.sectionTab,
                            isActive ? styles.sectionTabActive : null,
                          ]}
                        >
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.sectionTabText,
                              isActive ? styles.sectionTabTextActive : null,
                            ]}
                          >
                            {section.label} {sectionCounts[section.id]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <View style={styles.slotTray}>
                    <View style={styles.slotGrid}>
                      {Array.from({ length: slotCount }, (_, index) => {
                        const item = sectionItems[index];

                        if (!item) {
                          return (
                            <View
                              accessibilityLabel={`빈 슬롯 ${index + 1}`}
                              key={`empty-${index}`}
                              style={[styles.slot, { height: slotSize, width: slotSize }]}
                            />
                          );
                        }

                        const selected = selectedItemId === item.id;
                        return (
                          <Pressable
                            accessibilityLabel={`${item.name}, ${item.quantity}개`}
                            accessibilityRole="button"
                            key={item.id}
                            onPress={() => handleSelectItem(item)}
                            style={[
                              styles.slot,
                              selected ? styles.slotSelected : null,
                              { height: slotSize, width: slotSize },
                            ]}
                          >
                            <PixelItemIcon item={item} size={Math.round(slotSize * 0.62)} />
                            {item.isNew ? (
                              <View style={styles.newBadge}>
                                <Text style={styles.newBadgeText}>N</Text>
                              </View>
                            ) : null}
                            {item.equipped ? <View style={styles.equippedMarker} /> : null}
                            <Text style={styles.quantityText}>{item.quantity}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Pressable
                      accessibilityLabel={
                        selectedItem ? `${selectedItem.name} 버리기` : '버릴 아이템을 선택해 주세요'
                      }
                      accessibilityRole="button"
                      disabled={!selectedItem}
                      onPress={() => setPendingDeleteItemId(selectedItem?.id ?? null)}
                      style={({ pressed }) => [
                        styles.trashButton,
                        !selectedItem ? styles.trashButtonDisabled : null,
                        pressed && selectedItem ? styles.trashButtonPressed : null,
                      ]}
                    >
                      <PixelTrashIcon disabled={!selectedItem} />
                    </Pressable>
                  </View>

                  <View style={styles.divider} />
                  {selectedItem ? (
                    <View style={styles.detailPanel}>
                      <View style={styles.detailTopRow}>
                        <View style={styles.detailIconBox}>
                          <PixelItemIcon item={selectedItem} size={34} />
                        </View>
                        <View style={styles.detailCopy}>
                          <Text style={styles.itemName}>{selectedItem.name}</Text>
                          <Text style={styles.itemDescription}>
                            {selectedItem.description}
                          </Text>
                        </View>
                      </View>
                      {canEquipItem(selectedItem) ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void toggleEquipped(selectedItem.id)}
                          style={[
                            styles.equipButton,
                            selectedItem.equipped ? styles.equipButtonActive : null,
                          ]}
                        >
                          <Text style={styles.equipButtonText}>
                            {selectedItem.equipped ? '장착 해제' : '장착하기'}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ) : (
                    <View style={styles.emptyDetail}>
                      <Text style={styles.emptyDetailText}>
                        {sectionItems.length > 0
                          ? '아이템을 선택해 주세요.'
                          : `${getInventorySectionLabel(activeSection)}이 비어 있어요.`}
                      </Text>
                    </View>
                  )}
                  {pendingDeleteItem ? (
                    <View style={styles.deleteConfirmPanel}>
                      <Text style={styles.deleteConfirmText}>
                        {pendingDeleteItem.name} 아이템을 버릴까요?
                      </Text>
                      <View style={styles.deleteConfirmActions}>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => setPendingDeleteItemId(null)}
                          style={[styles.confirmButton, styles.cancelButton]}
                        >
                          <Text style={styles.cancelButtonText}>취소</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleConfirmDelete()}
                          style={[styles.confirmButton, styles.deleteButton]}
                        >
                          <Text style={styles.deleteButtonText}>버리기</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : null}
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
}

function PixelTrashIcon({ disabled }: { disabled: boolean }) {
  return (
    <View style={[styles.trashIcon, disabled ? styles.trashIconDisabled : null]}>
      <View style={styles.trashHandle} />
      <View style={styles.trashLid} />
      <View style={styles.trashBody}>
        <View style={styles.trashLine} />
        <View style={styles.trashLine} />
      </View>
    </View>
  );
}

function canEquipItem(item: InventoryItem): boolean {
  return item.category === 'tool'
    || item.category === 'decor'
    || getItemShopCategory(item.id) === 'object';
}

function getInventorySection(item: InventoryItem): InventorySection {
  const shopCategory = getItemShopCategory(item.id);

  if (
    item.category === 'decor'
    || shopCategory === 'object'
    || shopCategory === 'wallpaper'
    || shopCategory === 'flooring'
  ) {
    return 'decor';
  }

  return 'general';
}

function getInventorySectionLabel(section: InventorySection) {
  return inventorySections.find((entry) => entry.id === section)?.label ?? '아이템';
}

function PixelItemIcon({ item, size }: { item: InventoryItem; size: number }) {
  const color = categoryColors[item.category];
  const image = getItemImage(item.id);

  if (image) {
    return (
      <View style={[styles.itemImageBox, { height: size, width: size }]}>
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="contain"
          source={image}
          style={styles.itemImage}
        />
      </View>
    );
  }

  return (
    <View style={[styles.itemIcon, { backgroundColor: color, height: size, width: size }]}>
      <View style={styles.itemIconHighlight} />
      <View style={styles.itemIconShadow} />
      <Text
        numberOfLines={1}
        style={[styles.itemIconText, { fontSize: Math.max(10, Math.round(size * 0.34)) }]}
      >
        {item.symbol}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: '#f3d7a8',
    borderColor: '#8c603e',
  },
  cancelButtonText: {
    color: '#654333',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  capacityBadge: {
    alignItems: 'center',
    backgroundColor: '#ead4ad',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    minWidth: 50,
    paddingHorizontal: 7,
  },
  capacityText: {
    color: '#654333',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  closeButton: {
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
    fontFamily: pixelFontFamily,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 23,
  },
  content: {
    backgroundColor: '#fff8ea',
    paddingBottom: 14,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cornerBottomLeft: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    display: 'none',
    height: 3,
    left: 0,
    position: 'absolute',
    width: 18,
    zIndex: 4,
  },
  cornerBottomRight: {
    backgroundColor: '#3d2d28',
    bottom: 0,
    display: 'none',
    height: 3,
    position: 'absolute',
    right: 0,
    width: 18,
    zIndex: 4,
  },
  cornerTopLeft: {
    backgroundColor: '#3d2d28',
    display: 'none',
    height: 3,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 18,
    zIndex: 4,
  },
  cornerTopRight: {
    backgroundColor: '#3d2d28',
    display: 'none',
    height: 3,
    position: 'absolute',
    right: 0,
    top: 0,
    width: 18,
    zIndex: 4,
  },
  confirmButton: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 72,
    paddingHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#b94f3c',
    borderColor: '#6b2f27',
  },
  deleteButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: 6,
  },
  deleteConfirmPanel: {
    alignItems: 'center',
    backgroundColor: '#ffe2c0',
    borderColor: '#a34c39',
    borderWidth: 2,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 8,
    padding: 8,
  },
  deleteConfirmText: {
    color: '#693c31',
    flex: 1,
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    lineHeight: 14,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailIconBox: {
    alignItems: 'center',
    backgroundColor: '#fff3d7',
    borderColor: '#c68b53',
    borderWidth: 2,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  detailPanel: {
    backgroundColor: '#fff0cc',
    borderColor: '#9a603d',
    borderWidth: 2,
    padding: 9,
  },
  detailTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  divider: {
    borderColor: '#d39a5f',
    borderStyle: 'dashed',
    borderTopWidth: 2,
    marginVertical: 10,
  },
  emptyDetail: {
    alignItems: 'center',
    backgroundColor: '#fff0cc',
    borderColor: '#b98b5a',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 68,
  },
  emptyDetailText: {
    color: '#876349',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  equipButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    borderWidth: 2,
    justifyContent: 'center',
    marginTop: 9,
    minHeight: 38,
    minWidth: 104,
    paddingHorizontal: 12,
  },
  equipButtonActive: {
    backgroundColor: '#748865',
    borderColor: '#40543d',
  },
  equipButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
  },
  equippedMarker: {
    backgroundColor: '#72a15f',
    borderColor: '#3f6639',
    borderWidth: 1,
    bottom: 3,
    height: 7,
    left: 3,
    position: 'absolute',
    width: 7,
  },
  errorText: {
    color: '#a94738',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  eyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    marginBottom: 4,
  },
  frameShadowBottom: {
    backgroundColor: '#6b432f',
    bottom: -4,
    height: 5,
    left: 5,
    position: 'absolute',
    right: -4,
  },
  frameShadowRight: {
    backgroundColor: '#8c5f3e',
    bottom: -4,
    position: 'absolute',
    right: -4,
    top: 5,
    width: 5,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff8ea',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 7,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  innerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: 'transparent',
    borderWidth: 0,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  itemDescription: {
    color: '#7a5947',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 15,
    marginTop: 4,
  },
  itemIcon: {
    alignItems: 'center',
    borderColor: '#4d3a35',
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  itemIconHighlight: {
    backgroundColor: 'rgba(255,255,255,0.55)',
    height: 3,
    left: 3,
    position: 'absolute',
    top: 3,
    width: 8,
  },
  itemIconShadow: {
    backgroundColor: 'rgba(52,39,34,0.22)',
    bottom: 2,
    height: 4,
    position: 'absolute',
    right: 2,
    width: 9,
  },
  itemIconText: {
    color: '#fff9e8',
    fontFamily: pixelFontFamily,
    fontWeight: '900',
    textShadowColor: '#4d3a35',
    textShadowOffset: { height: 1, width: 1 },
    textShadowRadius: 0,
  },
  itemImage: {
    height: '92%',
    width: '92%',
  },
  itemImageBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    color: '#4b2f25',
    fontFamily: pixelFontFamily,
    fontSize: 12,
    fontWeight: '900',
  },
  loadingState: {
    alignItems: 'center',
    gap: 9,
    justifyContent: 'center',
    minHeight: 260,
  },
  loadingText: {
    color: '#876349',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '700',
  },
  newBadge: {
    alignItems: 'center',
    backgroundColor: '#e36d64',
    borderColor: '#fff1d5',
    borderRadius: 6,
    borderWidth: 1,
    height: 14,
    justifyContent: 'center',
    position: 'absolute',
    right: -3,
    top: -4,
    width: 14,
    zIndex: 2,
  },
  newBadgeText: {
    color: '#ffffff',
    fontFamily: pixelFontFamily,
    fontSize: 7,
    fontWeight: '900',
  },
  outerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    padding: 0,
    position: 'relative',
    zIndex: 2,
  },
  popupBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.58)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  popupFrame: {
    maxHeight: '86%',
    position: 'relative',
  },
  popupLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 40,
  },
  quantityText: {
    bottom: 1,
    color: '#3e2d25',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    position: 'absolute',
    right: 3,
    textShadowColor: '#fff2cf',
    textShadowOffset: { height: 1, width: 1 },
    textShadowRadius: 0,
  },
  sectionTab: {
    alignItems: 'center',
    backgroundColor: '#ead4ad',
    borderColor: '#8c603e',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 0,
    paddingHorizontal: 8,
  },
  sectionTabActive: {
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
  },
  sectionTabText: {
    color: '#654333',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0,
  },
  sectionTabTextActive: {
    color: '#fff8ea',
  },
  sectionTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: '#f2bd72',
    borderColor: '#c47c34',
    borderWidth: 2,
    justifyContent: 'center',
    position: 'relative',
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  slotSelected: {
    backgroundColor: '#ffd98e',
    borderColor: '#fff0ba',
    borderWidth: 3,
  },
  slotTray: {
    backgroundColor: '#d38b37',
    borderColor: '#7d4219',
    borderWidth: 3,
    padding: 4,
    position: 'relative',
  },
  title: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
  },
  trashBody: {
    alignItems: 'center',
    borderColor: '#fff2d4',
    borderTopWidth: 0,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 3,
    height: 17,
    justifyContent: 'center',
    width: 18,
  },
  trashButton: {
    alignItems: 'center',
    backgroundColor: '#b94f3c',
    borderColor: '#672f27',
    borderWidth: 2,
    bottom: 8,
    height: 38,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 38,
    zIndex: 5,
  },
  trashButtonDisabled: {
    backgroundColor: '#bd8b58',
    borderColor: '#8b633e',
    opacity: 0.75,
  },
  trashButtonPressed: {
    bottom: 6,
  },
  trashHandle: {
    backgroundColor: '#fff2d4',
    height: 3,
    width: 8,
  },
  trashIcon: {
    alignItems: 'center',
    height: 25,
    justifyContent: 'flex-end',
    width: 24,
  },
  trashIconDisabled: {
    opacity: 0.65,
  },
  trashLid: {
    backgroundColor: '#fff2d4',
    height: 3,
    marginBottom: 2,
    width: 23,
  },
  trashLine: {
    backgroundColor: '#fff2d4',
    height: 9,
    width: 2,
  },
});
