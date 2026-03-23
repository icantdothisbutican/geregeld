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
import { loadState, saveState, AppState } from '../../src/store/appStore';
import { getFilteredChapters, Chapter } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';
import { FLOWS } from '../../src/data/flows';

function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = {
    high: { label: 'Belangrijk', bg: Colors.dangerLight, color: Colors.danger },
    medium: { label: 'Aanbevolen', bg: Colors.warningLight, color: Colors.warning },
    low: { label: 'Optioneel', bg: Colors.primaryLight, color: Colors.primaryDark },
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
  const progress = totalItems > 0 ? checkedItems.length / totalItems : 0;

  async function toggleItem(itemId: string) {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    await saveState({ checkedItems: newChecked });
    setState((prev) => prev ? { ...prev, checkedItems: newChecked } : prev);
  }

  function navigateToFlow(itemId: string) {
    // Handle guide step flows
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
        <View style={styles.header}>
          <Text style={styles.title}>Te Doen</Text>
          <Text style={styles.subtitle}>
            {totalItems - checkedItems.length} van {totalItems} dingen om te regelen
          </Text>
          <ProgressBar progress={progress} />
          {progress === 1 && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeText}>Alles geregeld! Goed bezig.</Text>
            </View>
          )}
        </View>

        {allChapters.map((chapter) => {
          const isExpanded = expandedChapter === chapter.key;
          const chapterChecked = chapter.items.filter((i) => checkedItems.includes(i.id)).length;
          const chapterDone = chapterChecked === chapter.items.length;
          const isGuide = chapter.key === 'overlijden-gids';

          return (
            <Card key={chapter.key} style={[styles.chapterCard, isGuide && styles.guideChapterCard]}>
              <TouchableOpacity
                style={styles.chapterHeader}
                onPress={() => setExpandedChapter(isExpanded ? null : chapter.key)}
                activeOpacity={0.7}
              >
                <View style={styles.chapterTitleContent}>
                  <Text style={[styles.chapterLabel, isGuide && styles.guideChapterLabel]}>{chapter.label}</Text>
                  <Text style={styles.chapterDesc}>{chapter.description}</Text>
                </View>
                <View style={styles.chapterMeta}>
                  {chapterDone ? (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>Klaar</Text>
                    </View>
                  ) : (
                    <Text style={styles.chapterCount}>
                      {chapterChecked}/{chapter.items.length}
                    </Text>
                  )}
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View>
                  {isGuide && (
                    <View style={styles.guideNote}>
                      <Text style={styles.guideNoteText}>
                        Neem de tijd. Deze stappen hoeven niet allemaal vandaag.
                      </Text>
                    </View>
                  )}
                  {chapter.items.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    const hasFlow = item.hasFlow && (
                      item.id.startsWith('guide-step-')
                        ? !!GUIDE_STEPS.find((s) => `guide-step-${s.step}` === item.id)?.flowId
                        : !!FLOWS[item.id]
                    );

                    return (
                      <View key={item.id} style={[styles.checkItem, isChecked && styles.checkItemDone]}>
                        <TouchableOpacity
                          style={styles.checkRow}
                          onPress={() => toggleItem(item.id)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                            {isChecked && <Text style={styles.checkmark}>✓</Text>}
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
                            <Text style={styles.flowButtonArrow}>→</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
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
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  completeBanner: {
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  completeText: {
    fontSize: FontSizes.body,
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  chapterCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  guideChapterCard: {
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderWidth: 1,
  },
  chapterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  chapterTitleContent: {
    flex: 1,
    gap: 2,
    marginRight: Spacing.md,
  },
  chapterLabel: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  guideChapterLabel: {
    color: Colors.accent,
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
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    color: Colors.primary,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  guideNote: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  guideNoteText: {
    fontSize: FontSizes.small,
    color: Colors.warning,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  checkItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    padding: Spacing.lg,
  },
  checkItemDone: {
    backgroundColor: Colors.primaryLight,
  },
  checkRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: '#0B0B14',
    fontSize: 16,
    fontWeight: '700',
  },
  checkContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  checkTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  checkTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
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
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: '600',
  },
  itemDuration: {
    fontSize: FontSizes.caption,
    color: Colors.textSecondary,
  },
  timingBadge: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  timingText: {
    fontSize: FontSizes.caption,
    fontWeight: '500',
    color: Colors.accent,
  },
  flowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    marginLeft: 44,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  flowButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  flowButtonArrow: {
    fontSize: FontSizes.large,
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
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
