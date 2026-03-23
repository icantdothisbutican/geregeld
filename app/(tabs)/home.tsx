import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { loadState, AppState } from '../../src/store/appStore';
import { getFilteredChapters } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';
import { FLOWS } from '../../src/data/flows';

export default function HomeScreen() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, [])
  );

  if (!state) return null;

  const chapters = getFilteredChapters(state.situation, state.onboarding);
  const allItems = chapters.flatMap((ch) => ch.items);
  const guideItemCount = GUIDE_STEPS.length;
  const totalItems = allItems.length + guideItemCount;
  const checkedItems = state.checkedItems || [];
  const checkedRegular = checkedItems.filter((id) => !id.startsWith('guide-step-')).length;
  const checkedGuide = checkedItems.filter((id) => id.startsWith('guide-step-')).length;
  const checkedCount = checkedRegular + checkedGuide;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;
  const userName = state.onboarding?.name || '';

  const uncheckedItems = allItems.filter((item) => !checkedItems.includes(item.id));

  const bigTask = uncheckedItems.find(
    (item) => item.urgency === 'high' && item.hasFlow
  ) || uncheckedItems.find(
    (item) => item.urgency === 'high'
  );

  const easyTask = uncheckedItems.find(
    (item) => item.urgency !== 'high' && item.duration.includes('5 min') && item.id !== bigTask?.id
  ) || uncheckedItems.find(
    (item) => item.urgency === 'low' && item.id !== bigTask?.id
  ) || uncheckedItems.find(
    (item) => item.id !== bigTask?.id
  );

  function navigateToFlow(itemId: string) {
    if (FLOWS[itemId]) {
      router.push(`/flow/${itemId}`);
    }
  }

  const progressPercent = Math.round(progress * 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with settings */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greetingLabel}>
              {userName ? `Hoi ${userName}` : 'Welkom terug'}
            </Text>
            <Text style={styles.tagline}>Heb je het geregeld?</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress Card - with gradient */}
        <GradientCard
          colors={GRADIENT_PRESETS.purpleTeal}
          style={styles.progressCardOuter}
        >
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressLabel}>Jouw voortgang</Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressCountBubble}>
              <Text style={styles.progressCountText}>
                {checkedCount}/{totalItems}
              </Text>
            </View>
          </View>
          <ProgressBar progress={progress} color={Colors.primary} />
          <Text style={styles.progressHint}>
            {progress === 1
              ? 'Alles geregeld! Goed bezig.'
              : `Nog ${totalItems - checkedCount} ${totalItems - checkedCount === 1 ? 'ding' : 'dingen'} te regelen`}
          </Text>
        </GradientCard>

        {/* Recommended activities */}
        {(bigTask || easyTask) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Aanbevolen</Text>
            <Text style={styles.sectionTitle}>Volgende stappen</Text>

            {bigTask && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => bigTask.hasFlow ? navigateToFlow(bigTask.id) : null}
              >
                <GradientCard colors={GRADIENT_PRESETS.pinkPurple} style={styles.taskCardOuter}>
                  <View style={styles.taskBadgeRow}>
                    <View style={styles.importantBadge}>
                      <Text style={styles.importantBadgeText}>Belangrijk</Text>
                    </View>
                    <Text style={styles.taskDuration}>{bigTask.duration}</Text>
                  </View>
                  <Text style={styles.bigTaskTitle}>{bigTask.title}</Text>
                  <Text style={styles.taskDescription}>{bigTask.description}</Text>
                  {bigTask.hasFlow && (
                    <View style={styles.startFlow}>
                      <Text style={styles.startFlowText}>
                        {bigTask.actionLabel || 'Start'}
                      </Text>
                      <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                    </View>
                  )}
                </GradientCard>
              </TouchableOpacity>
            )}

            {easyTask && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => easyTask.hasFlow ? navigateToFlow(easyTask.id) : null}
              >
                <GradientCard colors={GRADIENT_PRESETS.tealGreen} style={styles.taskCardOuter}>
                  <View style={styles.taskBadgeRow}>
                    <View style={styles.easyBadge}>
                      <Text style={styles.easyBadgeText}>Snel te doen</Text>
                    </View>
                    <Text style={styles.taskDuration}>{easyTask.duration}</Text>
                  </View>
                  <Text style={styles.easyTaskTitle}>{easyTask.title}</Text>
                  <Text style={styles.taskDescription}>{easyTask.description}</Text>
                </GradientCard>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Trusted person */}
        {state.onboarding?.trustedPerson && (
          <Card style={styles.infoCard}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="people-outline" size={20} color={Colors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vertrouwenspersoon</Text>
              <Text style={styles.infoValue}>
                {state.onboarding.trustedPerson.name}
                {state.onboarding.trustedPerson.relation
                  ? ` — ${state.onboarding.trustedPerson.relation}`
                  : ''}
              </Text>
            </View>
          </Card>
        )}

        {/* Shared account hint */}
        <GradientCard colors={GRADIENT_PRESETS.teal} style={styles.sharedCardOuter}>
          <Text style={styles.sharedTitle}>Gedeeld account</Text>
          <Text style={styles.sharedText}>
            Deel de toegang met je partner, kinderen of vertrouwenspersoon zodat zij ook dingen kunnen regelen.
          </Text>
        </GradientCard>

        <View style={styles.bottomPadding} />
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  headerLeft: {
    flex: 1,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingLabel: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: FontSizes.h1,
    color: Colors.text,
    fontWeight: FontWeights.heavy,
    marginTop: Spacing.xs,
    letterSpacing: -0.5,
  },
  progressCardOuter: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  progressLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  progressPercent: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -1,
  },
  progressCountBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  progressCountText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
  },
  progressHint: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginTop: -Spacing.sm,
    letterSpacing: -0.3,
  },
  taskCardOuter: {
    // just for spacing
  },
  taskBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  importantBadge: {
    backgroundColor: 'rgba(244, 114, 182, 0.2)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  importantBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    color: Colors.pink,
  },
  taskDuration: {
    fontSize: FontSizes.caption,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  bigTaskTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  taskDescription: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  startFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  startFlowText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  easyBadge: {
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  easyBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  easyTaskTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  infoCard: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
    marginTop: 2,
  },
  sharedCardOuter: {
    marginBottom: Spacing.lg,
  },
  sharedTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  sharedText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
