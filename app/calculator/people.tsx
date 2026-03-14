import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

import PersonList from '@/components/calculator/PersonList';
import SlideContainer from '@/components/SlideContainer';
import { useCalculator } from '@/context/CalculatorContext';

export default function PeopleSlide() {
  const { state, addPerson, setPersonLevel, setPeopleCount } = useCalculator();
  const router = useRouter();

  return (
    <SlideContainer question="Who's drinking?">
      {state.mode === 'personalized' ? (
        <PersonList
          people={state.people}
          onAdd={addPerson}
          onLevelChange={setPersonLevel}
        />
      ) : (
        <View>
          {/* TODO: replace with a styled stepper component */}
          <Text>People: {state.peopleCount}</Text>
          <Button title="-" onPress={() => setPeopleCount(Math.max(1, state.peopleCount - 1))} />
          <Button title="+" onPress={() => setPeopleCount(state.peopleCount + 1)} />
        </View>
      )}
      <Button title="Next →" onPress={() => router.push('/calculator/glass')} />
    </SlideContainer>
  );
}
