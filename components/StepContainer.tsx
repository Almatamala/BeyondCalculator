import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import Animated, { SlideInLeft, SlideInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SlideProgress from "./SlideProgress";

export interface Step {
  question: string;
  content: React.ReactNode;
  contentStyle?: ViewStyle;
  /** When false, renders a plain View instead of ScrollView — card shrinks to content height */
  scrollable?: boolean;
  /** Card expands to fill all available vertical space, header pushed up */
  expandCard?: boolean;
  /** Card wraps exactly to content height, no height constraints applied */
  fitContent?: boolean;
  /** Fixed content rendered below the scrollable area (e.g. confirm button) */
  bottomContent?: React.ReactNode;
}

export interface StepContainerRef {
  scrollContentToEnd: () => void;
}

interface Props {
  steps: Step[];
  currentStep: number;
  direction: "forward" | "backward";
  onBack?: () => void;
}

const BG_IMAGE = require("@/assets/images/piscola.jpg");
const ANIM_DURATION = 300;

const StepContainer = forwardRef<StepContainerRef, Props>(
  ({ steps, currentStep, direction, onBack }, ref) => {
    const { height } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const step = steps[currentStep];
    const scrollRef = useRef<ScrollView>(null);

    useImperativeHandle(ref, () => ({
      scrollContentToEnd: () => {
        scrollRef.current?.scrollToEnd({ animated: true });
      },
    }));

    const entering =
      direction === "forward"
        ? SlideInRight.duration(ANIM_DURATION)
        : SlideInLeft.duration(ANIM_DURATION);

    return (
      <ImageBackground source={BG_IMAGE} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />

        {/* Back button — absolute, top-left of the whole screen */}
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.backBtn, { top: insets.top + 8 }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.top,
            { paddingTop: step.expandCard ? insets.top + 56 : insets.top + 24 },
            step.expandCard && styles.topCompact,
          ]}
        >
          <Animated.Text
            key={`q-${currentStep}`}
            entering={entering}
            style={styles.question}
          >
            {step.question}
          </Animated.Text>
          <SlideProgress total={steps.length} current={currentStep} />
        </View>

        <View
          style={[
            styles.card,
            { paddingBottom: insets.bottom + 16 },
            step.expandCard && { flex: 1 },
          ]}
        >
          {/* Animated content area */}
          <View
            style={[
              styles.contentWrapper,
              step.fitContent
                ? undefined
                : step.expandCard
                  ? { flex: 1 }
                  : step.scrollable === false
                    ? { maxHeight: height * 0.50 }
                    : { height: height * 0.50 },
            ]}
          >
            <Animated.View
              key={currentStep}
              entering={entering}
              style={
                !step.fitContent && (step.scrollable !== false || step.expandCard)
                  ? { flex: 1 }
                  : undefined
              }
            >
              {step.fitContent || (step.scrollable === false && !step.expandCard) ? (
                <View style={[styles.cardContent, step.contentStyle]}>
                  {step.content}
                </View>
              ) : (
                <ScrollView
                  ref={scrollRef}
                  style={{ flex: 1 }}
                  contentContainerStyle={[styles.cardContent, step.contentStyle]}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {step.content}
                </ScrollView>
              )}
            </Animated.View>
          </View>

          {/* Optional fixed bottom content */}
          {step.bottomContent}
        </View>
      </ImageBackground>
    );
  },
);

StepContainer.displayName = "StepContainer";

export default StepContainer;

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
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
  topCompact: {
    flex: 0,
    justifyContent: "flex-start",
    paddingBottom: 20,
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
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  contentWrapper: {
    overflow: "hidden",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  cardContent: {
    padding: 16,
    gap: 16,
  },
});
