import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
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
    // Mark the item as checked
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>Terug</Text>
          </TouchableOpacity>
          <View style={styles.progressSection}>
            <ProgressBar progress={progress} />
            <Text style={styles.stepIndicator}>
              Stap {currentStep + 1} van {flow.steps.length}
            </Text>
          </View>
        </View>

        {/* Flow title (only on first step) */}
        {currentStep === 0 && (
          <View style={styles.flowIntro}>
            <Text style={styles.flowTitle}>{flow.title}</Text>
            <Text style={styles.flowSubtitle}>{flow.subtitle}</Text>
            <View style={styles.durationBadge}>
              <Text style={styles.durationText}>{flow.duration}</Text>
            </View>
          </View>
        )}

        {/* Current step */}
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
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          )}

          {step.actionType === 'call' && step.actionLabel && (
            <TouchableOpacity
              style={[styles.actionButton, styles.callButton]}
              onPress={() => handleAction(step)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>{step.actionLabel}</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Navigation */}
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
    alignSelf: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  backText: {
    fontSize: FontSizes.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressSection: {
    gap: Spacing.sm,
  },
  stepIndicator: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  flowIntro: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  flowTitle: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text,
  },
  flowSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  durationText: {
    fontSize: FontSizes.small,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  stepCard: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
    color: Colors.text,
  },
  stepDescription: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
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
    marginTop: 8,
  },
  detailText: {
    fontSize: FontSizes.body,
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  callButton: {
    backgroundColor: Colors.successLight,
  },
  actionButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  actionArrow: {
    fontSize: FontSizes.large,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  navigation: {
    gap: Spacing.sm,
  },
});
