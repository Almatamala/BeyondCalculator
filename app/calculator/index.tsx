import { useRouter } from 'expo-router';

import ModeSelector from '@/components/calculator/ModeSelector';
import SlideContainer from '@/components/SlideContainer';
import { useCalculator } from '@/context/CalculatorContext';
import { Mode } from '@/types/calculator';

export default function HomeSlide() {
  const { setMode } = useCalculator();
  const router = useRouter();

  const handleSelect = (mode: Mode) => {
    setMode(mode);
    router.push('/calculator/people');
  };

  return (
    <SlideContainer question="How is everyone drinking tonight?">
      <ModeSelector onSelect={handleSelect} />
    </SlideContainer>
  );
}
