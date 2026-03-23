import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { FLOWS, FlowStep } from '../../src/data/flows';
import { loadState, saveState } from '../../src/store/appStore';

export default function FlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

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

  async function handleConfirm() {
    const state = await loadState();
    const checkedItems = state.checkedItems || [];
    if (!checkedItems.includes(flow.id)) {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          <GradientCard colors={GRADIENT_PRESETS.purpleTeal} style={styles.flowIntroCard}>
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
              title="Volgende"
              onPress={() => setCurrentStep(currentStep + 1)}
              variant="secondary"
            />
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
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
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
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
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
});
