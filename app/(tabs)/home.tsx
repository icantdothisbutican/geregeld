import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { ProgressBar } from '../../src/components/ProgressBar';
import { loadState, AppState } from '../../src/store/appStore';
import { getFilteredChapters } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';

export default function HomeScreen() {
  const [state, setState] = useState<AppState | null>(null);
  const [expandedGuideStep, setExpandedGuideStep] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, [])
  );

  if (!state) return null;

  const chapters = getFilteredChapters(state.situation, state.onboarding);
  const totalItems = chapters.reduce((sum, ch) => sum + ch.items.length, 0);
  const checkedCount = state.checkedItems?.length || 0;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;
  const userName = state.onboarding?.name || '';

  // Find next priority item
  const nextItem = chapters
    .flatMap((ch) => ch.items)
    .find((item) => !state.checkedItems?.includes(item.id) && item.urgency === 'high');

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
          ) : progress === 0 ? (
            <Text style={styles.progressHint}>Begin met je eerste stap</Text>
          ) : (
            <Text style={styles.progressHint}>
              Nog {totalItems - checkedCount} {totalItems - checkedCount === 1 ? 'ding' : 'dingen'} te regelen
            </Text>
          )}
        </Card>

        {/* Next action */}
        {nextItem && (
          <Card style={styles.nextActionCard}>
            <Text style={styles.nextActionLabel}>Volgende stap</Text>
            <Text style={styles.nextActionTitle}>{nextItem.title}</Text>
            <Text style={styles.nextActionDesc}>{nextItem.description}</Text>
          </Card>
        )}

        {/* Quick stats */}
        {state.onboarding?.trustedPerson && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoIcon}>🤝</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vertrouwenspersoon</Text>
              <Text style={styles.infoValue}>
                {state.onboarding.trustedPerson.name}
                {state.onboarding.trustedPerson.relation
                  ? ` (${state.onboarding.trustedPerson.relation})`
                  : ''}
              </Text>
            </View>
          </Card>
        )}

        {/* Chapter overview */}
        <View style={styles.chaptersSection}>
          <Text style={styles.sectionTitle}>Hoofdstukken</Text>
          {chapters.map((chapter) => {
            const chapterChecked = chapter.items.filter(
              (i) => state.checkedItems?.includes(i.id)
            ).length;
            const chapterDone = chapterChecked === chapter.items.length;

            return (
              <Card key={chapter.key} style={styles.chapterCard}>
                <View style={styles.chapterRow}>
                  <Text style={styles.chapterIcon}>{chapter.icon}</Text>
                  <View style={styles.chapterInfo}>
                    <Text style={styles.chapterLabel}>{chapter.label}</Text>
                    <Text style={styles.chapterCount}>
                      {chapterChecked}/{chapter.items.length}
                    </Text>
                  </View>
                  {chapterDone && <Text style={styles.chapterDone}>✓</Text>}
                </View>
              </Card>
            );
          })}
        </View>

        {/* Guide section */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>Wat te doen bij een overlijden</Text>
          <Text style={styles.sectionSubtitle}>
            Een stap-voor-stap gids voor nabestaanden
          </Text>

          <View style={styles.importantCard}>
            <Text style={styles.importantTitle}>Het allerbelangrijkste</Text>
            <Text style={styles.importantText}>
              Neem de tijd om dit te verwerken. Deze stappen hoeven niet allemaal vandaag.
            </Text>
          </View>

          {GUIDE_STEPS.map((guideStep) => {
            const isExpanded = expandedGuideStep === guideStep.step;
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
                    <Text style={styles.guideTiming}>{guideStep.timing}</Text>
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.guideDetails}>
                    <Text style={styles.guideDescription}>{guideStep.description}</Text>
                    {guideStep.details.map((detail, i) => (
                      <View key={i} style={styles.detailRow}>
                        <Text style={styles.detailBullet}>•</Text>
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            );
          })}

          <View style={styles.bottomNote}>
            <Text style={styles.bottomNoteText}>
              Deze gids is specifiek voor Nederland. Bij twijfel, raadpleeg altijd een professional.
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
    backgroundColor: Colors.cream,
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
    fontWeight: '800',
    color: Colors.slate,
  },
  tagline: {
    fontSize: FontSizes.large,
    color: Colors.terracotta,
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
    color: Colors.slate,
  },
  progressCount: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.slateMuted,
  },
  progressHint: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  nextActionCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.orangeBg,
    gap: Spacing.xs,
  },
  nextActionLabel: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: Colors.terracotta,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextActionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  nextActionDesc: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    lineHeight: 20,
  },
  infoCard: {
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoIcon: {
    fontSize: 28,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  infoValue: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.slate,
  },
  chaptersSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.h2,
    fontWeight: '800',
    color: Colors.slate,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    marginBottom: Spacing.md,
    marginTop: -Spacing.sm,
    lineHeight: 24,
  },
  chapterCard: {
    padding: Spacing.md,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  chapterIcon: {
    fontSize: 24,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterLabel: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.slate,
  },
  chapterCount: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  chapterDone: {
    fontSize: 18,
    color: Colors.green,
    fontWeight: '700',
  },
  guideSection: {
    marginBottom: Spacing.lg,
  },
  importantCard: {
    backgroundColor: Colors.orangeBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  importantTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  importantText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
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
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideNumberText: {
    color: Colors.white,
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
    color: Colors.slate,
  },
  guideTiming: {
    fontSize: FontSizes.small,
    color: Colors.terracotta,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.slateMuted,
  },
  guideDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.warmGray,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  guideDescription: {
    fontSize: FontSizes.body,
    color: Colors.slate,
    lineHeight: 24,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  detailBullet: {
    fontSize: FontSizes.body,
    color: Colors.green,
    fontWeight: '700',
  },
  detailText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    flex: 1,
    lineHeight: 22,
  },
  bottomNote: {
    backgroundColor: Colors.warmGray,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  bottomNoteText: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
