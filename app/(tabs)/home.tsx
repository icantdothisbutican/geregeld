import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
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
  const totalItems = allItems.length + GUIDE_STEPS.length;
  const checkedItems = state.checkedItems || [];
  // Only count IDs that map to a visible item — checkedItems can contain
  // stale entries (e.g. items hidden after a situation change).
  const validIds = new Set([
    ...allItems.map((item) => item.id),
    ...GUIDE_STEPS.map((s) => `guide-step-${s.step}`),
  ]);
  const checkedCount = checkedItems.filter((id) => validIds.has(id)).length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;
  const userName = state.onboarding?.name || '';

  const uncheckedItems = allItems.filter((item) => !checkedItems.includes(item.id));

  const bigTask = uncheckedItems.find(
    (item) => item.urgency === 'high' && item.hasFlow
  ) || uncheckedItems.find(
    (item) => item.urgency === 'high'
  );

  // "Quick" means the task takes 10 minutes or less
  const isQuick = (duration: string) => {
    const match = duration.match(/^(\d+)\s*min/);
    return !!match && parseInt(match[1], 10) <= 10;
  };

  const easyTask = uncheckedItems.find(
    (item) => item.urgency !== 'high' && isQuick(item.duration) && item.id !== bigTask?.id
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

        {/* Progress Card */}
        <GradientCard
          colors={GRADIENT_PRESETS.cool}
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
          <ProgressBar progress={progress} color="#fff" />
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
                <GradientCard colors={GRADIENT_PRESETS.warm} style={styles.taskCardOuter}>
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
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
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
                <GradientCard colors={GRADIENT_PRESETS.cool} style={styles.taskCardOuter}>
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
    marginBottom: Spacing.xl,
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
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  progressPercent: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: '#fff',
    letterSpacing: -1,
  },
  progressCountBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  progressCountText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressHint: {
    fontSize: FontSizes.small,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.xl,
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
    // spacing from GradientCard
  },
  taskBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  importantBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  importantBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    color: '#fff',
  },
  taskDuration: {
    fontSize: FontSizes.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: FontWeights.medium,
  },
  bigTaskTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    color: '#fff',
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  taskDescription: {
    fontSize: FontSizes.body,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 22,
  },
  startFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  startFlowText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: '#fff',
  },
  easyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  easyBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    color: '#fff',
  },
  easyTaskTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.semibold,
    color: '#fff',
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  infoCard: {
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  bottomPadding: {
    height: Spacing.xxl,
  },
});
