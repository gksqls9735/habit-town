import { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const septemberAttendanceEventBannerImage = require('../../../../assets/ui/event/attendance-banners/september-attendance-event.png');
const octoberAttendanceEventBannerImage = require('../../../../assets/ui/event/attendance-banners/october-attendance-event.png');
const novemberAttendanceEventBannerImage = require('../../../../assets/ui/event/attendance-banners/november-attendance-event.png');
const decemberAttendanceEventBannerImage = require('../../../../assets/ui/event/attendance-banners/december-attendance-event.png');
const pixelFontFamily = 'Galmuri11';
const pixelatedImageStyle =
  Platform.OS === 'web'
    ? ({ imageRendering: 'pixelated' } as unknown as ImageStyle)
    : null;

type EventBanner = {
  dateText: string;
  id: string;
  image: ImageSourcePropType;
  title: string;
};

const eventBanners: EventBanner[] = [
  {
    dateText: '09.01 - 09.30',
    id: 'september-attendance',
    image: septemberAttendanceEventBannerImage,
    title: '9월 출석이벤트',
  },
  {
    dateText: '10.01 - 10.31',
    id: 'october-attendance',
    image: octoberAttendanceEventBannerImage,
    title: '10월 출석이벤트',
  },
  {
    dateText: '11.01 - 11.30',
    id: 'november-attendance',
    image: novemberAttendanceEventBannerImage,
    title: '11월 출석이벤트',
  },
  {
    dateText: '12.01 - 12.31',
    id: 'december-attendance',
    image: decemberAttendanceEventBannerImage,
    title: '12월 출석이벤트',
  },
];

type EventPopupProps = {
  onClose: () => void;
  visible: boolean;
  width: number;
};

export function EventPopup({ onClose, visible, width }: EventPopupProps) {
  const [selectedBanner, setSelectedBanner] = useState<EventBanner | null>(null);

  if (!visible) {
    return null;
  }

  const closePopup = () => {
    setSelectedBanner(null);
    onClose();
  };

  return (
    <View style={styles.popupLayer}>
      <TouchableWithoutFeedback onPress={closePopup}>
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
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>EVENT BOARD</Text>
                <Text style={styles.title}>이벤트</Text>
              </View>
              <Pressable
                accessibilityLabel="이벤트 팝업 닫기"
                accessibilityRole="button"
                onPress={closePopup}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.divider} />
              <View style={styles.bannerList}>
                {eventBanners.map((banner) => (
                  <Pressable
                    accessibilityLabel={`${banner.title}, ${banner.dateText}`}
                    accessibilityRole="button"
                    key={banner.id}
                    onPress={() => setSelectedBanner(banner)}
                    style={styles.eventBanner}
                  >
                    <Image
                      accessibilityIgnoresInvertColors
                      resizeMode="stretch"
                      source={banner.image}
                      style={[styles.bannerImage, pixelatedImageStyle]}
                    />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>

      {selectedBanner ? (
        <EventDetailPopup
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
          width={width}
        />
      ) : null}
    </View>
  );
}

function EventDetailPopup({
  banner,
  onClose,
  width,
}: {
  banner: EventBanner;
  onClose: () => void;
  width: number;
}) {
  return (
    <View style={styles.detailLayer}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.detailBackdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.detailFrame, { width: Math.min(width - 18, 330) }]}>
        <View style={styles.outerBorder}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
          <View style={styles.innerBorder}>
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>EVENT DETAIL</Text>
                <Text numberOfLines={1} style={styles.title}>
                  {banner.title}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="이벤트 상세 팝업 닫기"
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <View style={styles.detailContent} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerImage: {
    height: 92,
    width: '100%',
  },
  bannerList: {
    gap: 10,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#ffd99e',
    borderColor: '#6b432f',
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    marginLeft: 8,
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
    paddingTop: 4,
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
  divider: {
    borderColor: '#d39a5f',
    borderStyle: 'dashed',
    borderTopWidth: 2,
    marginBottom: 12,
  },
  detailBackdrop: {
    backgroundColor: 'rgba(49, 42, 35, 0.24)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  detailContent: {
    backgroundColor: '#fff8ea',
    minHeight: 220,
  },
  detailFrame: {
    maxHeight: '78%',
    position: 'relative',
  },
  detailLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    padding: 16,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 55,
  },
  eventBanner: {
    overflow: 'hidden',
  },
  eyebrow: {
    color: '#b36b31',
    fontFamily: pixelFontFamily,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0,
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
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  innerBorder: {
    backgroundColor: '#fff8ea',
    borderColor: 'transparent',
    borderWidth: 0,
    maxHeight: '100%',
    overflow: 'hidden',
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
    zIndex: 42,
  },
  title: {
    color: '#35281f',
    fontFamily: pixelFontFamily,
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 0,
  },
});
