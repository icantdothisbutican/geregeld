import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { FLOWS, FlowStep, FormField } from '../../src/data/flows';
import { loadState, saveState, generateId } from '../../src/store/appStore';

export default function FlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());

  const flow = id ? FLOWS[id] : null;

  if (!flow) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Flow niet gevonden</Text>
          <Button title="Terug" onPress={() => router.back()} variant="outline" size="medium" />
        </View>
      </SafeAreaView>
    );
  }

  const step = flow.steps[currentStep];
  const isLastStep = currentStep === flow.steps.length - 1;
  const progress = (currentStep + 1) / flow.steps.length;

  function updateFormField(key: string, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }

  async function saveFormToVault(step: FlowStep) {
    if (!step.formFields || !step.vaultTitle) return;

    const filledFields = step.formFields
      .filter((f) => formData[f.key]?.trim())
      .map((f) => `${f.label}: ${formData[f.key].trim()}`)
      .join('\n');

    if (!filledFields) return;

    const state = await loadState();
    const vaultItems = state.vaultItems || [];
    vaultItems.push({
      id: generateId(),
      title: step.vaultTitle,
      category: step.vaultCategory || 'document',
      content: filledFields,
      createdAt: new Date().toISOString(),
    });
    await saveState({ vaultItems });
    setSavedSteps((prev) => new Set(prev).add(currentStep));
  }

  async function handleNext() {
    // Save form data to vault if this step has form fields
    if (step.formFields && step.vaultTitle && !savedSteps.has(currentStep)) {
      await saveFormToVault(step);
    }
    setCurrentStep(currentStep + 1);
  }

  async function handleConfirm() {
    // Save any remaining form data
    if (step.formFields && step.vaultTitle && !savedSteps.has(currentStep)) {
      await saveFormToVault(step);
    }

    const state = await loadState();
    const checkedItems = state.checkedItems || [];
    if (flow && !checkedItems.includes(flow.id)) {
      await saveState({ checkedItems: [...checkedItems, flow.id] });
    }
    router.back();
  }

  function handleAction(step: FlowStep) {
    if (step.actionType === 'link' && step.actionUrl) {
      Linking.openURL(step.actionUrl);
    } else if (step.actionType === 'call' && step.actionPhone) {
      Linking.openURL(step.actionPhone);
    }
  }

  const hasFormFields = step.formFields && step.formFields.length > 0;
  const hasFilledFields = step.formFields?.some((f) => formData[f.key]?.trim());
  const isSaved = savedSteps.has(currentStep);

  function getInputType(field: FormField) {
    switch (field.type) {
      case 'password': return true;
      case 'email': return false;
      case 'phone': return false;
      default: return false;
    }
  }

  function getKeyboardType(field: FormField): any {
    switch (field.type) {
      case 'phone': return 'phone-pad';
      case 'email': return 'email-address';
      case 'number': return 'numeric';
      default: return 'default';
    }
  }

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
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.progressSection}>
              <ProgressBar progress={progress} color={Colors.accent} />
              <Text style={styles.stepIndicator}>
                Stap {currentStep + 1} van {flow.steps.length}
              </Text>
            </View>
          </View>

          {currentStep === 0 && (
            <GradientCard colors={GRADIENT_PRESETS.cool} style={styles.flowIntroCard}>
              <Text style={styles.flowTitle}>{flow.title}</Text>
              <Text style={styles.flowSubtitle}>{flow.subtitle}</Text>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color={Colors.accent} />
                <Text style={styles.durationText}>{flow.duration}</Text>
              </View>
            </GradientCard>
          )}

          <Card style={styles.stepCard}>
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>

            {step.details && step.details.length > 0 && (
              <View style={styles.detailsList}>
                {step.details.map((detail, i) => (
                  <View key={i} style={styles.detailRow}>
                    <View style={styles.detailDot} />
                    <Text style={styles.detailText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Form fields */}
            {hasFormFields && (
              <View style={styles.formSection}>
                {step.formFields!.map((field) => (
                  <View key={field.key} style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <TextInput
                      style={[
                        styles.fieldInput,
                        field.type === 'multiline' && styles.fieldMultiline,
                      ]}
                      placeholder={field.placeholder}
                      placeholderTextColor={Colors.textTertiary}
                      value={formData[field.key] || ''}
                      onChangeText={(val) => updateFormField(field.key, val)}
                      secureTextEntry={getInputType(field)}
                      keyboardType={getKeyboardType(field)}
                      multiline={field.type === 'multiline'}
                      autoCapitalize={field.type === 'email' ? 'none' : 'sentences'}
                    />
                  </View>
                ))}

                {/* Vault save indicator */}
                {step.vaultTitle && (
                  <View style={styles.vaultIndicator}>
                    <Ionicons
                      name={isSaved ? 'shield-checkmark' : 'shield-outline'}
                      size={16}
                      color={isSaved ? Colors.primary : Colors.textTertiary}
                    />
                    <Text style={[styles.vaultIndicatorText, isSaved && styles.vaultSavedText]}>
                      {isSaved
                        ? 'Opgeslagen in je kluis'
                        : 'Wordt beveiligd opgeslagen in je kluis'}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {step.actionType === 'link' && step.actionLabel && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(step)}
                activeOpacity={0.7}
              >
                <Text style={styles.actionButtonText}>{step.actionLabel}</Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            )}

            {step.actionType === 'call' && step.actionLabel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleAction(step)}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={16} color={Colors.primary} />
                <Text style={styles.actionButtonText}>{step.actionLabel}</Text>
              </TouchableOpacity>
            )}
          </Card>

          <View style={styles.navigation}>
            {step.actionType === 'confirm' ? (
              <Button
                title={step.actionLabel || 'Afgerond'}
                onPress={handleConfirm}
                variant="primary"
              />
            ) : isLastStep ? (
              <Button
                title="Afronden"
                onPress={handleConfirm}
                variant="primary"
              />
            ) : (
              <Button
                title={hasFormFields && hasFilledFields ? 'Opslaan & volgende' : 'Volgende'}
                onPress={handleNext}
                variant="secondary"
              />
            )}

            {hasFormFields && !isLastStep && !isSaved && hasFilledFields && (
              <Text style={styles.saveHint}>
                Je gegevens worden automatisch opgeslagen in je kluis
              </Text>
            )}

            {currentStep > 0 && (
              <Button
                title="Vorige stap"
                onPress={() => setCurrentStep(currentStep - 1)}
                variant="outline"
                size="medium"
                style={{ marginTop: Spacing.sm }}
              />
            )}
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.large,
    color: Colors.textSecondary,
  },
  header: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  progressSection: {
    gap: Spacing.sm,
  },
  stepIndicator: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  flowIntroCard: {
    marginBottom: Spacing.lg,
  },
  flowTitle: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  flowSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  durationText: {
    fontSize: FontSizes.small,
    color: Colors.accent,
    fontWeight: FontWeights.semibold,
  },
  stepCard: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  stepDescription: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  detailsList: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },
  detailText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  formSection: {
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  fieldContainer: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    letterSpacing: 0.2,
  },
  fieldInput: {
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fieldMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  vaultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  vaultIndicatorText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  vaultSavedText: {
    color: Colors.primary,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  callButton: {
    justifyContent: 'flex-start',
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  navigation: {
    gap: Spacing.sm,
  },
  saveHint: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
});
