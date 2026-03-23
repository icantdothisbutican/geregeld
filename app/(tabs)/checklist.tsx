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
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, AppState } from '../../src/store/appStore';
import { getFilteredChapters, Chapter } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';
import { FLOWS } from '../../src/data/flows';

function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = {
    high: { label: 'Belangrijk', bg: 'rgba(248, 113, 113, 0.15)', color: Colors.danger },
    medium: { label: 'Aanbevolen', bg: 'rgba(251, 191, 36, 0.15)', color: Colors.warning },
    low: { label: 'Optioneel', bg: 'rgba(45, 212, 191, 0.15)', color: Colors.primary },
  }[urgency] || { label: '', bg: Colors.fill, color: Colors.text };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

interface GuideChapter {
  key: string;
  label: string;
  description: string;
  items: {
    id: string;
    title: string;
    description: string;
    urgency: 'high' | 'medium' | 'low';
    duration: string;
    hasFlow?: boolean;
    actionLabel?: string;
    timing?: string;
  }[];
}

function getGuideChapter(): GuideChapter {
  return {
    key: 'overlijden-gids',
    label: 'Bij een overlijden',
    description: 'Stap-voor-stap gids voor nabestaanden',
    items: GUIDE_STEPS.map((step) => ({
      id: `guide-step-${step.step}`,
      title: `${step.step}. ${step.title}`,
      description: step.description,
      urgency: step.timing === 'Direct' ? 'high' as const : step.timing.includes('24') || step.timing.includes('1-2') ? 'high' as const : 'medium' as const,
      duration: step.duration,
      hasFlow: !!step.flowId,
      actionLabel: 'Direct regelen',
      timing: step.timing,
    })),
  };
}

export default function ChecklistScreen() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        setState(s);
        setChapters(getFilteredChapters(s.situation, s.onboarding));
      });
    }, [])
  );

  if (!state) return null;

  const guideChapter = getGuideChapter();
  const allChapters = [...chapters, guideChapter];

  const checkedItems = state.checkedItems || [];
  const totalItems = allChapters.reduce((sum, ch) => sum + ch.items.length, 0);
  const checkedCount = checkedItems.filter((id) =>
    allChapters.some((ch) => ch.items.some((item) => item.id === id))
  ).length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  async function toggleItem(itemId: string) {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    await saveState({ checkedItems: newChecked });
    setState((prev) => prev ? { ...prev, checkedItems: newChecked } : prev);
  }

  function navigateToFlow(itemId: string) {
    if (itemId.startsWith('guide-step-')) {
      const stepNum = parseInt(itemId.replace('guide-step-', ''));
      const guideStep = GUIDE_STEPS.find((s) => s.step === stepNum);
      if (guideStep?.flowId && FLOWS[guideStep.flowId]) {
        router.push(`/flow/${guideStep.flowId}`);
        return;
      }
    }
    if (FLOWS[itemId]) {
      router.push(`/flow/${itemId}`);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Checklist</Text>
          <Text style={styles.title}>Te Doen</Text>
        </View>

        {/* Progress summary */}
        <GradientCard colors={GRADIENT_PRESETS.accent} style={styles.progressCard}>
          <View style={styles.progressRow}>
            <View>
              <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
              <Text style={styles.progressHint}>
                {totalItems - checkedCount} van {totalItems} open
              </Text>
            </View>
            <View style={styles.progressBarWrap}>
              <ProgressBar progress={progress} color={Colors.accent} />
            </View>
          </View>
          {progress === 1 && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeText}>Alles geregeld!</Text>
            </View>
          )}
        </GradientCard>

        {/* Chapters */}
        {allChapters.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapter === chapter.key;
          const chapterChecked = chapter.items.filter((i) => checkedItems.includes(i.id)).length;
          const chapterDone = chapterChecked === chapter.items.length;
          const isGuide = chapter.key === 'overlijden-gids';

          // Alternate gradient colors for visual variety
          const chapterGradients = [
            GRADIENT_PRESETS.purple,
            GRADIENT_PRESETS.teal,
            GRADIENT_PRESETS.pinkPurple,
            GRADIENT_PRESETS.tealGreen,
            GRADIENT_PRESETS.warmSunset,
            GRADIENT_PRESETS.purpleTeal,
          ];
          const gradientColors = isGuide
            ? GRADIENT_PRESETS.pinkPurple
            : chapterGradients[chapterIndex % chapterGradients.length];

          return (
            <View key={chapter.key} style={styles.chapterWrapper}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpandedChapter(isExpanded ? null : chapter.key)}
              >
                <GradientCard colors={gradientColors}>
                  <View style={styles.chapterHeader}>
                    <View style={styles.chapterTitleContent}>
                      <Text style={styles.chapterLabel}>{chapter.label}</Text>
                      <Text style={styles.chapterDesc}>{chapter.description}</Text>
                    </View>
                    <View style={styles.chapterMeta}>
                      {chapterDone ? (
                        <View style={styles.doneBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          <Text style={styles.doneBadgeText}>Klaar</Text>
                        </View>
                      ) : (
                        <Text style={styles.chapterCount}>
                          {chapterChecked}/{chapter.items.length}
                        </Text>
                      )}
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textTertiary}
                      />
                    </View>
                  </View>
                </GradientCard>
              </TouchableOpacity>

              {isExpanded && (
                <Card style={styles.expandedContent}>
                  {isGuide && (
                    <View style={styles.guideNote}>
                      <Ionicons name="heart-outline" size={16} color={Colors.warning} />
                      <Text style={styles.guideNoteText}>
                        Neem de tijd. Deze stappen hoeven niet allemaal vandaag.
                      </Text>
                    </View>
                  )}
                  {chapter.items.map((item, idx) => {
                    const isChecked = checkedItems.includes(item.id);
                    const hasFlow = item.hasFlow && (
                      item.id.startsWith('guide-step-')
                        ? !!GUIDE_STEPS.find((s) => `guide-step-${s.step}` === item.id)?.flowId
                        : !!FLOWS[item.id]
                    );

                    return (
                      <View key={item.id} style={[
                        styles.checkItem,
                        idx > 0 && styles.checkItemBorder,
                        isChecked && styles.checkItemDone,
                      ]}>
                        <TouchableOpacity
                          style={styles.checkRow}
                          onPress={() => toggleItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <Ionicons name="checkmark" size={16} color="#0B0B14" />}
                          </View>
                          <View style={styles.checkContent}>
                            <Text style={[styles.checkTitle, isChecked && styles.checkTitleDone]}>
                              {item.title}
                            </Text>
                            <Text style={styles.checkDescription}>{item.description}</Text>
                            <View style={styles.checkMeta}>
                              <UrgencyBadge urgency={item.urgency} />
                              <Text style={styles.itemDuration}>{item.duration}</Text>
                              {('timing' in item && item.timing) ? (
                                <View style={styles.timingBadge}>
                                  <Text style={styles.timingText}>{item.timing as string}</Text>
                                </View>
                              ) : null}
                            </View>
                          </View>
                        </TouchableOpacity>

                        {hasFlow && !isChecked && (
                          <TouchableOpacity
                            style={styles.flowButton}
                            onPress={() => navigateToFlow(item.id)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.flowButtonText}>
                              {item.actionLabel || 'Direct regelen'}
                            </Text>
                            <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </Card>
              )}
            </View>
          );
        })}

        <View style={styles.bottomNote}>
          <Text style={styles.bottomNoteText}>
            Specifiek voor Nederland. Bij twijfel, raadpleeg altijd een professional.
          </Text>
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
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  headerLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  progressCard: {
    marginBottom: Spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  progressPercent: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -1,
  },
  progressHint: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  progressBarWrap: {
    flex: 1,
  },
  completeBanner: {
    marginTop: Spacing.md,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  completeText: {
    fontSize: FontSizes.body,
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    textAlign: 'center',
  },
  chapterWrapper: {
    marginBottom: Spacing.md,
    gap: 0,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chapterTitleContent: {
    flex: 1,
    gap: 3,
    marginRight: Spacing.md,
  },
  chapterLabel: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  chapterDesc: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chapterCount: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    fontWeight: FontWeights.semibold,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  doneBadgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  expandedContent: {
    marginTop: -Spacing.sm,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 0,
    overflow: 'hidden',
  },
  guideNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  guideNoteText: {
    fontSize: FontSizes.small,
    color: Colors.warning,
    fontWeight: FontWeights.medium,
    fontStyle: 'italic',
    flex: 1,
  },
  checkItem: {
    padding: Spacing.lg,
  },
  checkItemBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  checkItemDone: {
    backgroundColor: 'rgba(45, 212, 191, 0.05)',
  },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  checkTitle: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  checkTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  checkDescription: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checkMeta: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semibold,
  },
  itemDuration: {
    fontSize: FontSizes.caption,
    color: Colors.textTertiary,
  },
  timingBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  timingText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.medium,
    color: Colors.accent,
  },
  flowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    marginLeft: 42,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  flowButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  bottomNote: {
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  bottomNoteText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
