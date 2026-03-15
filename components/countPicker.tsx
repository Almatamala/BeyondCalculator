// components/calculator/CountPicker.tsx
import { Pressable, Text, TextInput, View } from "react-native";

interface CountPickerProps {
  value: number;
  onChange: (value: number) => void;
  alignItems?: 'center' | 'flex-start' | 'flex-end' | 'stretch' | 'baseline';
}

export default function CountPicker({ value, onChange, alignItems = 'center' }: CountPickerProps) {
  return (
    <View style={{ gap: 12, alignItems }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 12,
          borderWidth: 1.5,
          borderColor: '#D1D5DB',
          overflow: 'hidden',
          backgroundColor: '#F9FAFB',
        }}
      >
        <Pressable
          onPress={() => onChange(Math.max(1, value - 1))}
          style={({ pressed }) => ({
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: pressed ? '#E5E7EB' : 'transparent',
          })}
        >
          <Text style={{ fontSize: 35, fontWeight: '300', color: '#374151' }}> − </Text>
        </Pressable>

        <View style={{ width: 1, height: 28, backgroundColor: '#D1D5DB' }} />

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
            minWidth: 64,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: '600',
            color: '#111827',
            paddingVertical: 14,
            paddingHorizontal: 8,
            backgroundColor: '#FFFFFF',
          }}
        />

        <View style={{ width: 1, height: 28, backgroundColor: '#D1D5DB' }} />

        <Pressable
          onPress={() => onChange(value + 1)}
          style={({ pressed }) => ({
            paddingHorizontal: 20,
            paddingVertical: 14,
            backgroundColor: pressed ? '#E5E7EB' : 'transparent',
          })}
        >
          <Text style={{ fontSize: 35, fontWeight: '300', color: '#374151' }}> + </Text>
        </Pressable>
      </View>
    </View>
  );
}