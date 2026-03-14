import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SlideProgress from "./SlideProgress";

export interface Slide {
  question: string;
  content: React.ReactNode;
}

export interface SlideContainerRef {
  scrollTo: (index: number) => void;
}

interface Props {
  slides: Slide[];
}

const BG_IMAGE = require("@/assets/images/piscola.jpg");

const SlideContainer = forwardRef<SlideContainerRef, Props>(({ slides }, ref) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      scrollRef.current?.scrollTo({ x: index * width, animated: true });
      setCurrentIndex(index);
    },
  }));

  const handleScrollEnd = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      onMomentumScrollEnd={handleScrollEnd}
      decelerationRate="fast"
    >
      {slides.map((slide, i) => (
        <ImageBackground
          key={i}
          source={BG_IMAGE}
          style={{ width, height }}
          resizeMode="cover"
        >
          <View style={styles.overlay} />

          <View style={[styles.top, { paddingTop: insets.top + 24 }]}>
            <Text style={styles.question}>{slide.question}</Text>
            <SlideProgress total={slides.length} current={currentIndex} />
          </View>

          <ScrollView
            style={[styles.card, { maxHeight: height * 0.58 }]}
            contentContainerStyle={[
              styles.cardContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {slide.content}
          </ScrollView>
        </ImageBackground>
      ))}
    </ScrollView>
  );
});

SlideContainer.displayName = "SlideContainer";

export default SlideContainer;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  top: {
    flex: 1,
    paddingHorizontal: 28,
    paddingBottom: 32,
    justifyContent: "flex-end",
    gap: 24,
  },
  question: {
    fontSize: 34,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 42,
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  cardContent: {
    padding: 24,
    gap: 20,
  },
});
