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
import { getItemShopCategory, type ItemCatalogShopCategory } from '../../items/itemCatalog';

const pixelFontFamily = 'Galmuri11';

type InventorySection = 'general' | 'decor';
type DecorInventoryCategory = 'all' | ItemCatalogShopCategory;

const inventorySections: readonly { id: InventorySection; label: string }[] = [
  { id: 'general', label: '일반 아이템' },
  { id: 'decor', label: '꾸미기 아이템' },
];
const decorInventoryCategories: readonly { id: DecorInventoryCategory; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'object', label: '가구/소품' },
  { id: 'wallpaper', label: '벽지' },
  { id: 'flooring', label: '바닥재' },
];

const categoryColors: Record<InventoryItemCategory, string> = {
  decor: '#9b6bc4',
  material: '#4e9db3',
  'pet-care': '#d56d70',
  tool: '#6b78b8',
};

export function InventoryModal({
  onInventoryChanged,
  onClose,
  visible,
  width,
}: {
  onInventoryChanged?: () => void;
  onClose: () => void;
  visible: boolean;
  width: number;
}) {
  const { capacities, deleteItem, errorMessage, isLoading, items, refresh, selectItem, toggleEquipped } =
    useInventory();
  const [activeSection, setActiveSection] = useState<InventorySection>('general');
  const [activeDecorCategory, setActiveDecorCategory] = useState<DecorInventoryCategory>('all');
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const sectionItems = useMemo(
    () => items.filter((item) => (
      activeSection === 'decor'
        ? getInventorySection(item) === 'decor'
          && matchesDecorInventoryCategory(item, activeDecorCategory)
        : getInventorySection(item) === 'general'
    )),
    [activeDecorCategory, activeSection, items],
  );
  const sectionCounts = useMemo(
    () => ({
      decor: items.filter((item) => getInventorySection(item) === 'decor').length,
      general: items.filter((item) => getInventorySection(item) === 'general').length,
    }),
    [items],
  );
  const decorCategoryCounts = useMemo(
    () => ({
      all: items.filter((item) => getInventorySection(item) === 'decor').length,
      flooring: items.filter((item) => getDecorInventoryCategory(item) === 'flooring').length,
      object: items.filter((item) => getDecorInventoryCategory(item) === 'object').length,
      wallpaper: items.filter((item) => getDecorInventoryCategory(item) === 'wallpaper').length,
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
  const activeSectionItemCount = sectionCounts[activeSection];
  const activeSectionCapacity = capacities[activeSection === 'decor' ? 'decor' : 'general'];
  const visibleSlotCount = Math.max(activeSectionCapacity, sectionItems.length);
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

    const nextItem = items.find((item) => (
      section === 'decor'
        ? getInventorySection(item) === 'decor'
          && matchesDecorInventoryCategory(item, activeDecorCategory)
        : getInventorySection(item) === 'general'
    ));

    setActiveSection(section);
    setPendingDeleteItemId(null);
    setSelectedItemId(nextItem?.id ?? null);
  };

  const handleDecorCategoryPress = (category: DecorInventoryCategory) => {
    if (activeDecorCategory === category) {
      return;
    }

    const nextItem = items.find((item) =>
      getInventorySection(item) === 'decor' && matchesDecorInventoryCategory(item, category),
    );

    setActiveDecorCategory(category);
    setPendingDeleteItemId(null);
    setSelectedItemId(nextItem?.id ?? null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteItem) return;
    const deleted = await deleteItem(pendingDeleteItem.id);
    if (deleted) {
      setPendingDeleteItemId(null);
      setSelectedItemId(null);
      onInventoryChanged?.();
    }
  };

  const handleToggleEquipped = async (id: string) => {
    await toggleEquipped(id);
    onInventoryChanged?.();
  };

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.popupBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.popupFrame, { width }]}>
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
                    {activeSectionItemCount}/{activeSectionCapacity}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="가방 닫기"
                  accessibilityRole="button"
                  onPress={onClose}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeText}>x</Text>
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
                  {activeSection === 'decor' ? (
                    <View style={styles.decorCategoryTabs}>
                      {decorInventoryCategories.map((category) => {
                        const isActive = activeDecorCategory === category.id;

                        return (
                          <Pressable
                            accessibilityRole="tab"
                            accessibilityState={{ selected: isActive }}
                            key={category.id}
                            onPress={() => handleDecorCategoryPress(category.id)}
                            style={[
                              styles.decorCategoryTab,
                              isActive ? styles.decorCategoryTabActive : null,
                            ]}
                          >
                            <Text
                              numberOfLines={1}
                              style={[
                                styles.decorCategoryTabText,
                                isActive ? styles.decorCategoryTabTextActive : null,
                              ]}
                            >
                              {category.label} {decorCategoryCounts[category.id]}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : null}
                  <View style={styles.slotTray}>
                    <View style={styles.slotGrid}>
                      {Array.from({ length: visibleSlotCount }, (_, index) => {
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
                      <View style={styles.detailActions}>
                        <Pressable
                          accessibilityLabel={`${selectedItem.name} 버리기`}
                          accessibilityRole="button"
                          onPress={() => setPendingDeleteItemId(selectedItem.id)}
                          style={[styles.detailActionButton, styles.detailDeleteButton]}
                        >
                          <Text style={styles.detailDeleteButtonText}>버리기</Text>
                        </Pressable>
                        {canEquipItem(selectedItem) ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => void handleToggleEquipped(selectedItem.id)}
                          style={[
                            styles.detailActionButton,
                            styles.equipButton,
                            selectedItem.equipped ? styles.equipButtonActive : null,
                          ]}
                        >
                          <Text style={styles.equipButtonText}>
                            {getItemActionLabel(selectedItem)}
                          </Text>
                        </Pressable>
                        ) : null}
                      </View>
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
                  {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
      <DeleteConfirmPopup
        item={pendingDeleteItem}
        onCancel={() => setPendingDeleteItemId(null)}
        onConfirm={handleConfirmDelete}
        width={width}
      />
    </View>
  );
}

function DeleteConfirmPopup({
  item,
  onCancel,
  onConfirm,
  width,
}: {
  item: InventoryItem | null;
  onCancel: () => void;
  onConfirm: () => void;
  width: number;
}) {
  if (!item) {
    return null;
  }

  return (
    <View style={styles.deletePopupLayer}>
      <Pressable
        accessibilityLabel="아이템 버리기 취소"
        accessibilityRole="button"
        onPress={onCancel}
        style={styles.deletePopupBackdrop}
      />
      <View style={[styles.deletePopupFrame, { width: Math.min(width - 28, 320) }]}>
        <View style={styles.deletePopupShadow} />
        <View style={styles.deletePopupPanel}>
          <Text style={styles.deletePopupTitle}>아이템 버리기</Text>
          <Text style={styles.deletePopupText}>
            {item.name} 아이템을 버릴까요?
          </Text>
          <View style={styles.deleteConfirmActions}>
            <Pressable
              accessibilityRole="button"
              onPress={onCancel}
              style={[styles.confirmButton, styles.cancelButton]}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={[styles.confirmButton, styles.deleteButton]}
            >
              <Text style={styles.deleteButtonText}>버리기</Text>
            </Pressable>
          </View>
        </View>
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

function getItemActionLabel(item: InventoryItem) {
  if (getInventorySection(item) === 'decor') {
    return item.equipped ? '적용 해제' : '적용하기';
  }

  return item.equipped ? '장착 해제' : '장착하기';
}

function getDecorInventoryCategory(item: InventoryItem): ItemCatalogShopCategory | undefined {
  const shopCategory = getItemShopCategory(item.id);

  if (shopCategory === 'wallpaper' || shopCategory === 'flooring') {
    return shopCategory;
  }

  return item.category === 'decor' || shopCategory === 'object' ? 'object' : undefined;
}

function matchesDecorInventoryCategory(
  item: InventoryItem,
  category: DecorInventoryCategory,
): boolean {
  return category === 'all' || getDecorInventoryCategory(item) === category;
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
    height: 36,
    justifyContent: 'center',
    width: 36,
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
    justifyContent: 'flex-end',
  },
  deletePopupBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.34)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  deletePopupFrame: {
    position: 'relative',
  },
  deletePopupLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 18,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 50,
  },
  deletePopupPanel: {
    backgroundColor: '#fff8ea',
    borderColor: '#3d2d28',
    borderWidth: 2,
    gap: 10,
    padding: 14,
    position: 'relative',
    zIndex: 2,
  },
  deletePopupShadow: {
    backgroundColor: '#6b432f',
    bottom: -4,
    left: 4,
    position: 'absolute',
    right: -4,
    top: 4,
  },
  deletePopupText: {
    color: '#693c31',
    fontFamily: pixelFontFamily,
    fontSize: 10,
    fontWeight: '900',
    lineHeight: 16,
  },
  deletePopupTitle: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0,
  },
  detailCopy: {
    flex: 1,
    minWidth: 0,
  },
  detailActionButton: {
    alignItems: 'center',
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 12,
  },
  detailActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 9,
  },
  detailDeleteButton: {
    backgroundColor: '#b94f3c',
    borderColor: '#6b2f27',
    minWidth: 86,
  },
  detailDeleteButtonText: {
    color: '#fff8ea',
    fontFamily: pixelFontFamily,
    fontSize: 11,
    fontWeight: '900',
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
  decorCategoryTab: {
    alignItems: 'center',
    backgroundColor: '#f8eddd',
    borderColor: '#d8c4a9',
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 0,
    paddingHorizontal: 5,
  },
  decorCategoryTabActive: {
    backgroundColor: '#705340',
    borderColor: '#705340',
  },
  decorCategoryTabText: {
    color: '#745c47',
    fontFamily: pixelFontFamily,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0,
  },
  decorCategoryTabTextActive: {
    color: '#fff8ec',
  },
  decorCategoryTabs: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
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
    backgroundColor: '#b96335',
    borderColor: '#6b321f',
    minWidth: 104,
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
});
