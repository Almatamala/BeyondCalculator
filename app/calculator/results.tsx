import { useRouter } from 'expo-router';
import { Button, View } from 'react-native';

import ResultCard from '@/components/calculator/ResultCard';
import SlideContainer from '@/components/SlideContainer';
import { useCalculator } from '@/context/CalculatorContext';
import { calculateResults } from '@/utils/calculations';

export default function ResultsSlide() {
  const { state, reset } = useCalculator();
  const router = useRouter();

  const results = calculateResults(state);

  const handleReset = () => {
    reset();
    router.replace('/calculator');
  };

  return (
    <SlideContainer question="Here's what you need">
      <View style={{ gap: 16 }}>
        <ResultCard label="Liquor" valueMl={results.liquorMl} />
        <ResultCard label="Soda" valueMl={results.sodaMl} />
      </View>
      <Button title="Start over" onPress={handleReset} />
    </SlideContainer>
  );
}
