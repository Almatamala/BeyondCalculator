import { useRouter } from 'expo-router';
import { Button } from 'react-native';

import GlassSelector from '@/components/calculator/GlassSelector';
import SlideContainer from '@/components/SlideContainer';
import { useCalculator } from '@/context/CalculatorContext';

export default function GlassSlide() {
  const { state, setGlassType } = useCalculator();
  const router = useRouter();

  return (
    <SlideContainer question="What size glass are you using?">
      <GlassSelector value={state.glassType} onChange={setGlassType} />
      <Button title="Next →" onPress={() => router.push('/calculator/results')} />
    </SlideContainer>
  );
}
