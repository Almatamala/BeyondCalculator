// components/calculator/CountPicker.tsx
import { Platform, Pressable, Text, TextInput, View } from "react-native";

const isWeb = Platform.OS === 'web';

interface CountPickerProps {
  value: number;
  onChange: (value: number) => void;
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
  compact?: boolean;
}

export default function CountPicker({ value, onChange, alignItems = 'center', compact = false }: CountPickerProps) {
  const btnPadH = compact ? 14 : isWeb ? 16 : 20;
  const btnPadV = compact ? 8 : isWeb ? 10 : 14;
  const fontSize = compact ? 24 : isWeb ? 24 : 35;
  const inputFontSize = compact ? 16 : isWeb ? 16 : 20;
  const inputMinWidth = compact ? 44 : isWeb ? 48 : 64;
  const inputPadV = compact ? 8 : isWeb ? 10 : 14;
  const borderRadius = compact ? 10 : 12;
  const dividerH = compact ? 22 : isWeb ? 22 : 28;

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
            // Evita el delay de 300ms en navegadores móviles
            ...(isWeb && { cursor: 'pointer' } as any),
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
            // Evita el zoom automático de Safari en inputs en iOS
            ...(isWeb && { fontSize: Math.max(inputFontSize, 16) } as any),
          }}
        />

        <View style={{ width: 1, height: dividerH, backgroundColor: '#D1D5DB' }} />

        <Pressable
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => ({
            paddingHorizontal: btnPadH,
            paddingVertical: btnPadV,
            backgroundColor: pressed ? '#E5E7EB' : 'transparent',
            ...(isWeb && { cursor: 'pointer' } as any),
          })}
        >
          <Text style={{ fontSize, fontWeight: '300', color: '#374151' }}> + </Text>
        </Pressable>
      </View>
    </View>
  );
}