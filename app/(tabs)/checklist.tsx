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

  const checkedItems = state.checkedItems || [];
  const totalItems = chapters.reduce((sum, ch) => sum + ch.items.length, 0);
  const progress = totalItems > 0 ? checkedItems.length / totalItems : 0;

  async function toggleItem(itemId: string) {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    await saveState({ checkedItems: newChecked });
    setState((prev) => prev ? { ...prev, checkedItems: newChecked } : prev);
  }

  function navigateToFlow(itemId: string) {
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

        {chapters.map((chapter) => {
          const isExpanded = expandedChapter === chapter.key;
          const chapterChecked = chapter.items.filter((i) => checkedItems.includes(i.id)).length;
          const chapterDone = chapterChecked === chapter.items.length;

          return (
            <Card key={chapter.key} style={styles.chapterCard}>
              <TouchableOpacity
                style={styles.chapterHeader}
                onPress={() => setExpandedChapter(isExpanded ? null : chapter.key)}
                activeOpacity={0.7}
              >
                <View style={styles.chapterTitleContent}>
                  <Text style={styles.chapterLabel}>{chapter.label}</Text>
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
                  {chapter.items.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    const hasFlow = item.hasFlow && FLOWS[item.id];

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
    color: Colors.primaryDark,
    fontWeight: '600',
    textAlign: 'center',
  },
  chapterCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
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
    color: Colors.primaryDark,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.textSecondary,
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
    color: Colors.surface,
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
  flowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    marginLeft: 44,
  },
  flowButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  flowButtonArrow: {
    fontSize: FontSizes.large,
    color: Colors.primaryDark,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
