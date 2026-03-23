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
import { loadState, AppState } from '../../src/store/appStore';
import { getFilteredChapters, ChecklistItem } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';
import { FLOWS } from '../../src/data/flows';

export default function HomeScreen() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [expandedGuideStep, setExpandedGuideStep] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, [])
  );

  if (!state) return null;

  const chapters = getFilteredChapters(state.situation, state.onboarding);
  const allItems = chapters.flatMap((ch) => ch.items);
  const totalItems = allItems.length;
  const checkedItems = state.checkedItems || [];
  const checkedCount = checkedItems.length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;
  const userName = state.onboarding?.name || '';

  // Find 2 recommended activities: 1 big/hard + 1 easy
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
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {userName ? `Hoi ${userName}` : 'Welkom terug'}
          </Text>
          <Text style={styles.tagline}>Heb je het geregeld?</Text>
        </View>

        {/* Progress Card */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Jouw voortgang</Text>
            <Text style={styles.progressCount}>
              {checkedCount}/{totalItems}
            </Text>
          </View>
          <ProgressBar progress={progress} />
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

        {/* Chapter overview */}
        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Hoofdstukken</Text>
          {chapters.map((chapter) => {
            const chapterChecked = chapter.items.filter(
              (i) => checkedItems.includes(i.id)
            ).length;
            const chapterDone = chapterChecked === chapter.items.length;

            return (
              <Card key={chapter.key} style={styles.chapterCard}>
                <View style={styles.chapterRow}>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterLabel}>{chapter.label}</Text>
                    <Text style={styles.chapterCount}>
                      {chapterChecked}/{chapter.items.length} afgerond
                    </Text>
                  </View>
                  {chapterDone && (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Klaar</Text>
                    </View>
                  )}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Guide section */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>Wat te doen bij een overlijden</Text>
          <Text style={styles.sectionSubtitle}>
            Een stap-voor-stap gids voor nabestaanden. Druk op een stap om direct geholpen te worden.
          </Text>

          <Card style={styles.importantNote}>
            <Text style={styles.importantNoteTitle}>Het allerbelangrijkste</Text>
            <Text style={styles.importantNoteText}>
              Neem de tijd om dit te verwerken. Deze stappen hoeven niet allemaal vandaag.
            </Text>
          </Card>

          {GUIDE_STEPS.map((guideStep) => {
            const isExpanded = expandedGuideStep === guideStep.step;
            const hasFlow = guideStep.flowId && FLOWS[guideStep.flowId];

            return (
              <Card key={guideStep.step} style={styles.guideCard}>
                <TouchableOpacity
                  style={styles.guideHeader}
                  onPress={() => setExpandedGuideStep(isExpanded ? null : guideStep.step)}
                  activeOpacity={0.7}
                >
                  <View style={styles.guideNumber}>
                    <Text style={styles.guideNumberText}>{guideStep.step}</Text>
                  </View>
                  <View style={styles.guideInfo}>
                    <Text style={styles.guideTitle}>{guideStep.title}</Text>
                    <View style={styles.guideMetaRow}>
                      <Text style={styles.guideTiming}>{guideStep.timing}</Text>
                      <Text style={styles.guideDuration}>{guideStep.duration}</Text>
                    </View>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.guideDetails}>
                    <Text style={styles.guideDescription}>{guideStep.description}</Text>
                    {guideStep.details.map((detail, i) => (
                      <View key={i} style={styles.detailRow}>
                        <View style={styles.detailDot} />
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                    {hasFlow && (
                      <TouchableOpacity
                        style={styles.guideAction}
                        onPress={() => router.push(`/flow/${guideStep.flowId}`)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.guideActionText}>Direct regelen</Text>
                        <Text style={styles.guideActionArrow}>→</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })}

          <View style={styles.bottomNote}>
            <Text style={styles.bottomNoteText}>
              Specifiek voor Nederland. Bij twijfel, raadpleeg altijd een professional.
            </Text>
          </View>
        </View>

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
  header: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
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
  sectionSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
    lineHeight: 24,
  },
  bigTaskCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    gap: Spacing.sm,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importantBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  importantBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.accent,
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
  },
  sharedTitle: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  sharedText: {
    fontSize: FontSizes.small,
    color: Colors.primaryDark,
    lineHeight: 20,
  },
  chaptersSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  chapterCard: {
    padding: Spacing.md,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chapterInfo: {
    flex: 1,
    gap: 2,
  },
  chapterLabel: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  chapterCount: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  doneBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  doneBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  guideSection: {
    marginBottom: Spacing.lg,
  },
  importantNote: {
    backgroundColor: Colors.warningLight,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  importantNoteTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  importantNoteText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  guideCard: {
    marginBottom: Spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  guideNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideNumberText: {
    color: Colors.surface,
    fontSize: FontSizes.body,
    fontWeight: '700',
  },
  guideInfo: {
    flex: 1,
    gap: 2,
  },
  guideTitle: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.text,
  },
  guideMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  guideTiming: {
    fontSize: FontSizes.small,
    color: Colors.accent,
    fontWeight: '500',
  },
  guideDuration: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  guideDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  guideDescription: {
    fontSize: FontSizes.body,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: Spacing.sm,
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
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 22,
  },
  guideAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  guideActionText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  guideActionArrow: {
    fontSize: FontSizes.large,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  bottomNote: {
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  bottomNoteText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
