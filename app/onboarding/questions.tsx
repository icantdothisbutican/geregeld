import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { ProgressBar } from '../../src/components/ProgressBar';
import { saveState, UserSituation, OnboardingData } from '../../src/store/appStore';

const TOTAL_STEPS = 9;

interface StepConfig {
  question: string;
  subtitle: string;
  type: 'choice' | 'text' | 'text-pair';
  options?: string[];
  placeholder?: string;
  placeholder2?: string;
}

const STEPS: StepConfig[] = [
  {
    question: 'Hoe mogen we je noemen?',
    subtitle: 'We maken alles persoonlijk voor jou',
    type: 'text',
    placeholder: 'Je voornaam',
  },
  {
    question: 'Wat is je leeftijdscategorie?',
    subtitle: 'Dit helpt ons de juiste prioriteiten te stellen',
    type: 'choice',
    options: ['18-30', '30-50', '50-65', '65+'],
  },
  {
    question: 'Heb je een partner?',
    subtitle: 'Getrouwd, samenwonend, of een relatie',
    type: 'choice',
    options: ['Ja', 'Nee'],
  },
  {
    question: 'Heb je kinderen?',
    subtitle: 'Eigen kinderen, stiefkinderen, of pleegkinderen',
    type: 'choice',
    options: ['Ja', 'Nee'],
  },
  {
    question: 'Huur je of koop je?',
    subtitle: 'Je woonsituatie bepaalt wat je moet regelen',
    type: 'choice',
    options: ['Huur', 'Koop', 'Anders'],
  },
  {
    question: 'Wat is je thuisadres?',
    subtitle: 'Op basis hiervan vinden we notarissen en uitvaartondernemers bij jou in de buurt',
    type: 'text',
    placeholder: 'Straat, huisnummer, postcode, stad',
  },
  {
    question: 'Heb je al een testament?',
    subtitle: 'Geen zorgen als het antwoord nee is — we helpen je verder',
    type: 'choice',
    options: ['Ja', 'Nee', 'Weet ik niet'],
  },
  {
    question: 'Digitaal of op papier?',
    subtitle: 'Hoe wil je dat je wachtwoorden en documenten bewaard worden?',
    type: 'choice',
    options: ['Digitaal', 'Op papier'],
  },
  {
    question: 'Wie is je vertrouwenspersoon?',
    subtitle: 'Deze persoon krijgt toegang tot je belangrijkste zaken. Je kunt dit later altijd wijzigen.',
    type: 'text-pair',
    placeholder: 'Naam',
    placeholder2: 'Relatie (bijv. partner, kind, vriend)',
  },
];

export default function OnboardingQuestions() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [hasPartner, setHasPartner] = useState<string | null>(null);
  const [hasChildren, setHasChildren] = useState<string | null>(null);
  const [housingType, setHousingType] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [hasTestament, setHasTestament] = useState<string | null>(null);
  const [preferenceMode, setPreferenceMode] = useState<string | null>(null);
  const [trustedName, setTrustedName] = useState('');
  const [trustedRelation, setTrustedRelation] = useState('');

  const currentStep = STEPS[step];

  function getCurrentAnswer(): string | null {
    switch (step) {
      case 0: return name || null;
      case 1: return ageRange;
      case 2: return hasPartner;
      case 3: return hasChildren;
      case 4: return housingType;
      case 5: return address || null;
      case 6: return hasTestament;
      case 7: return preferenceMode;
      case 8: return trustedName || null;
      default: return null;
    }
  }

  function selectAnswer(answer: string) {
    switch (step) {
      case 1: setAgeRange(answer); break;
      case 2: setHasPartner(answer); break;
      case 3: setHasChildren(answer); break;
      case 4: setHousingType(answer); break;
      case 6: setHasTestament(answer); break;
      case 7: setPreferenceMode(answer); break;
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 5: return true;
      case 8: return true;
      default: return getCurrentAnswer() !== null;
    }
  }

  async function handleNext() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      const situation: UserSituation = {
        hasPartner: hasPartner === 'Ja',
        hasChildren: hasChildren === 'Ja',
        housingType: housingType === 'Huur' ? 'huur' : housingType === 'Koop' ? 'koop' : 'anders',
      };

      const testamentMap: Record<string, 'ja' | 'nee' | 'weet-niet'> = {
        'Ja': 'ja',
        'Nee': 'nee',
        'Weet ik niet': 'weet-niet',
      };

      const onboarding: OnboardingData = {
        name: name.trim(),
        ageRange: ageRange as OnboardingData['ageRange'],
        hasTestament: hasTestament ? testamentMap[hasTestament] || null : null,
        preferenceMode: preferenceMode === 'Digitaal' ? 'digitaal' : preferenceMode === 'Op papier' ? 'analoog' : null,
        trustedPerson: trustedName.trim()
          ? { name: trustedName.trim(), relation: trustedRelation.trim() }
          : null,
        uitvaartWens: null,
        address: address.trim(),
      };

      await saveState({
        situation,
        onboarding,
        hasCompletedOnboarding: true,
      });

      router.replace('/(tabs)/home');
    }
  }

  const isLastStep = step === TOTAL_STEPS - 1;

  function getButtonLabel(): string {
    if (isLastStep) {
      return trustedName.trim() ? 'Start mijn checklist' : 'Sla over en start';
    }
    if (step === 5 && !address.trim()) {
      return 'Sla over';
    }
    return 'Volgende';
  }

  function getStepHint(): string | null {
    switch (step) {
      case 1:
        if (ageRange === '18-30') return 'Slim dat je hier nu al mee bezig bent.';
        if (ageRange === '65+') return 'Goed dat je dit regelt. We houden het simpel.';
        return null;
      case 5:
        if (address.trim()) return 'We zoeken automatisch notarissen en uitvaartondernemers bij jou in de buurt.';
        return null;
      case 6:
        if (hasTestament === 'Nee') return 'Geen zorgen — dit is een van de eerste dingen die we gaan regelen.';
        if (hasTestament === 'Ja') return 'We checken of je testament nog actueel is.';
        return null;
      case 7:
        if (preferenceMode === 'Digitaal') return 'We laten je zien hoe je wachtwoorden veilig deelt via je telefoon.';
        if (preferenceMode === 'Op papier') return 'We geven je handige templates om alles op papier vast te leggen.';
        return null;
      default: return null;
    }
  }

  const hint = getStepHint();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <ProgressBar progress={(step + 1) / TOTAL_STEPS} color={Colors.accent} />
              <Text style={styles.stepText}>Stap {step + 1} van {TOTAL_STEPS}</Text>
            </View>

            <View style={styles.questionSection}>
              {step === 0 && name.trim().length > 0 && (
                <Text style={styles.greeting}>Hoi {name}!</Text>
              )}
              <Text style={styles.question}>{currentStep.question}</Text>
              <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
            </View>

            <View style={styles.answerSection}>
              {currentStep.type === 'choice' && currentStep.options && (
                <View style={styles.optionsSection}>
                  {currentStep.options.map((option) => (
                    <ChoiceButton
                      key={option}
                      label={option}
                      selected={getCurrentAnswer() === option}
                      onPress={() => selectAnswer(option)}
                    />
                  ))}
                </View>
              )}

              {currentStep.type === 'text' && step === 0 && (
                <TextInput
                  style={styles.textInput}
                  placeholder={currentStep.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => canProceed() && handleNext()}
                />
              )}

              {currentStep.type === 'text' && step === 5 && (
                <TextInput
                  style={styles.textInput}
                  placeholder={currentStep.placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  value={address}
                  onChangeText={setAddress}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={() => canProceed() && handleNext()}
                />
              )}

              {currentStep.type === 'text-pair' && (
                <View style={styles.textPairSection}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={currentStep.placeholder}
                    placeholderTextColor={Colors.textTertiary}
                    value={trustedName}
                    onChangeText={setTrustedName}
                  />
                  {trustedName.trim().length > 0 && (
                    <TextInput
                      style={styles.textInput}
                      placeholder={currentStep.placeholder2}
                      placeholderTextColor={Colors.textTertiary}
                      value={trustedRelation}
                      onChangeText={setTrustedRelation}
                    />
                  )}
                </View>
              )}

              {hint && (
                <LinearGradient
                  colors={['rgba(102, 126, 234, 0.12)', 'rgba(77, 208, 225, 0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hintBox}
                >
                  <Text style={styles.hintText}>{hint}</Text>
                </LinearGradient>
              )}
            </View>

            <View style={styles.buttonSection}>
              <Button
                title={getButtonLabel()}
                onPress={handleNext}
                disabled={!canProceed()}
                variant={isLastStep ? 'primary' : 'secondary'}
              />
              {step > 0 && (
                <Button
                  title="Vorige"
                  onPress={() => setStep(step - 1)}
                  variant="outline"
                  size="medium"
                  style={{ marginTop: Spacing.sm }}
                />
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
    gap: Spacing.sm,
  },
  stepText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  questionSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: FontSizes.large,
    color: Colors.accent,
    fontWeight: FontWeights.semibold,
  },
  question: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  answerSection: {
    gap: Spacing.md,
  },
  optionsSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSizes.large,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  textPairSection: {
    gap: Spacing.md,
  },
  hintBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.15)',
  },
  hintText: {
    fontSize: FontSizes.small,
    color: Colors.accent,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  },
  buttonSection: {
    gap: Spacing.sm,
  },
});
