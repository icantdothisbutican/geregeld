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
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
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

  // Find 2 recommended activities
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header with settings */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {userName ? `Hoi ${userName}` : 'Welkom terug'}
            </Text>
            <Text style={styles.tagline}>Heb je het geregeld?</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Jouw voortgang</Text>
            <Text style={styles.progressCount}>
              {checkedCount}/{totalItems}
            </Text>
          </View>
          <ProgressBar progress={progress} color={Colors.accent} />
          {progress === 1 ? (
            <Text style={styles.progressHint}>Alles geregeld! Goed bezig.</Text>
          ) : (
            <Text style={styles.progressHint}>
              Nog {totalItems - checkedCount} {totalItems - checkedCount === 1 ? 'ding' : 'dingen'} te regelen
            </Text>
          )}
        </Card>

        {/* Two recommended activities */}
        {(bigTask || easyTask) && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.sectionTitle}>Aanbevolen voor jou</Text>

            {bigTask && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => bigTask.hasFlow ? navigateToFlow(bigTask.id) : null}
              >
                <Card style={styles.bigTaskCard}>
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
                      <Text style={styles.startFlowArrow}>→</Text>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            )}

            {easyTask && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => easyTask.hasFlow ? navigateToFlow(easyTask.id) : null}
              >
                <Card style={styles.easyTaskCard}>
                  <View style={styles.taskBadgeRow}>
                    <View style={styles.easyBadge}>
                      <Text style={styles.easyBadgeText}>Snel te doen</Text>
                    </View>
                    <Text style={styles.taskDuration}>{easyTask.duration}</Text>
                  </View>
                  <Text style={styles.easyTaskTitle}>{easyTask.title}</Text>
                  <Text style={styles.taskDescription}>{easyTask.description}</Text>
                </Card>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Trusted person */}
        {state.onboarding?.trustedPerson && (
          <Card style={styles.infoCard}>
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
        <Card style={styles.sharedCard}>
          <Text style={styles.sharedTitle}>Gedeeld account</Text>
          <Text style={styles.sharedText}>
            Dit account is ook via het web beschikbaar. Deel de toegang met je partner, kinderen of vertrouwenspersoon zodat zij ook dingen kunnen regelen.
          </Text>
        </Card>

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
    marginBottom: Spacing.lg,
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
  greeting: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text,
  },
  tagline: {
    fontSize: FontSizes.large,
    color: Colors.accent,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  progressCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  progressCount: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressHint: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  recommendationsSection: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.h2,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  bigTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.pink,
    gap: Spacing.sm,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importantBadge: {
    backgroundColor: Colors.pinkLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  importantBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.pink,
  },
  taskDuration: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bigTaskTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  taskDescription: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  startFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  startFlowText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  startFlowArrow: {
    fontSize: FontSizes.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  easyTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    gap: Spacing.sm,
  },
  easyBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  easyBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  easyTaskTitle: {
    fontSize: FontSizes.large,
    fontWeight: '600',
    color: Colors.text,
  },
  infoCard: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  sharedCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryLight,
    gap: Spacing.sm,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  sharedTitle: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.primary,
  },
  sharedText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
