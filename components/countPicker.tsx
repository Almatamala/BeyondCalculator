// components/calculator/CountPicker.tsx
import { Pressable, Text, TextInput, View } from "react-native";

interface CountPickerProps {
  value: number;
  onChange: (value: number) => void;
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
  compact?: boolean;
}

export default function CountPicker({ value, onChange, alignItems = 'center', compact = false }: CountPickerProps) {
  const btnPadH = compact ? 14 : 20;
  const btnPadV = compact ? 8 : 14;
  const fontSize = compact ? 24 : 35;
  const inputFontSize = compact ? 16 : 20;
  const inputMinWidth = compact ? 44 : 64;
  const inputPadV = compact ? 8 : 14;
  const borderRadius = compact ? 10 : 12;
  const dividerH = compact ? 22 : 28;

  return (
    <View style={{ gap: 12, alignItems }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius,
          borderWidth: 1.5,
          borderColor: '#D1D5DB',
          overflow: 'hidden',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Pressable
          onPress={() => onChange(Math.max(1, value - 1))}
          style={({ pressed }) => ({
            paddingHorizontal: btnPadH,
            paddingVertical: btnPadV,
            backgroundColor: pressed ? '#E5E7EB' : 'transparent',
          })}
        >
          <Text style={{ fontSize, fontWeight: '300', color: '#374151' }}> − </Text>
        </Pressable>

        <View style={{ width: 1, height: dividerH, backgroundColor: '#D1D5DB' }} />

        <TextInput
          value={String(value)}
          onChangeText={(text) => {
            const num = parseInt(text, 10);
            if (!isNaN(num) && num >= 1) onChange(num);
            else if (text === '') onChange(1);
          }}
          keyboardType="number-pad"
          selectTextOnFocus
          style={{
            minWidth: inputMinWidth,
            textAlign: 'center',
            fontSize: inputFontSize,
            fontWeight: '600',
            color: '#111827',
            paddingVertical: inputPadV,
            paddingHorizontal: 8,
            backgroundColor: '#FFFFFF',
          }}
        />

        <View style={{ width: 1, height: dividerH, backgroundColor: '#D1D5DB' }} />

        <Pressable
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => ({
            paddingHorizontal: btnPadH,
            paddingVertical: btnPadV,
            backgroundColor: pressed ? '#E5E7EB' : 'transparent',
          })}
        >
          <Text style={{ fontSize, fontWeight: '300', color: '#374151' }}> + </Text>
        </Pressable>
      </View>
    </View>
  );
}