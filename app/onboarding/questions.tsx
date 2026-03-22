import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { saveState, UserSituation } from '../../src/store/appStore';

type Step = 0 | 1 | 2;

const QUESTIONS = [
  {
    question: 'Heb je een partner?',
    subtitle: 'Getrouwd, samenwonend, of een relatie',
    options: ['Ja', 'Nee'],
  },
  {
    question: 'Heb je kinderen?',
    subtitle: 'Eigen kinderen, stiefkinderen, of pleegkinderen',
    options: ['Ja', 'Nee'],
  },
  {
    question: 'Huur je of koop je?',
    subtitle: 'Je woonsituatie bepaalt wat je moet regelen',
    options: ['Huur', 'Koop', 'Anders'],
  },
];

export default function OnboardingQuestions() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null]);

  const currentQuestion = QUESTIONS[step];
  const currentAnswer = answers[step];

  function selectAnswer(answer: string) {
    const newAnswers = [...answers];
    newAnswers[step] = answer;
    setAnswers(newAnswers);
  }

  async function handleNext() {
    if (step < 2) {
      setStep((step + 1) as Step);
    } else {
      const situation: UserSituation = {
        hasPartner: answers[0] === 'Ja',
        hasChildren: answers[1] === 'Ja',
        housingType: answers[2] === 'Huur' ? 'huur' : answers[2] === 'Koop' ? 'koop' : 'anders',
      };
      await saveState({ situation, hasCompletedOnboarding: true });
      router.replace('/(tabs)/checklist');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <ProgressBar progress={(step + 1) / 3} />
          <Text style={styles.stepText}>Vraag {step + 1} van 3</Text>
        </View>

        <View style={styles.questionSection}>
          <Text style={styles.question}>{currentQuestion.question}</Text>
          <Text style={styles.subtitle}>{currentQuestion.subtitle}</Text>
        </View>

        <View style={styles.optionsSection}>
          {currentQuestion.options.map((option) => (
            <ChoiceButton
              key={option}
              label={option}
              selected={currentAnswer === option}
              onPress={() => selectAnswer(option)}
            />
          ))}
        </View>

        <View style={styles.buttonSection}>
          <Button
            title={step < 2 ? 'Volgende' : 'Bekijk mijn checklist'}
            onPress={handleNext}
            disabled={currentAnswer === null}
            variant={step < 2 ? 'secondary' : 'primary'}
          />
          {step > 0 && (
            <Button
              title="Vorige"
              onPress={() => setStep((step - 1) as Step)}
              variant="outline"
              size="medium"
              style={{ marginTop: Spacing.sm }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    gap: Spacing.sm,
  },
  stepText: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    textAlign: 'center',
  },
  questionSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  question: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.slate,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    textAlign: 'center',
  },
  optionsSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonSection: {
    gap: Spacing.sm,
  },
});
