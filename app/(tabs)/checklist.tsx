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
import { loadState, saveState, AppState } from '../../src/store/appStore';
import { getFilteredChapters, Chapter } from '../../src/data/checklist';

function UrgencyBadge({ urgency }: { urgency: string }) {
  const config = {
    high: { label: 'Belangrijk', bg: Colors.redBg, color: Colors.red },
    medium: { label: 'Aanbevolen', bg: Colors.orangeBg, color: Colors.orange },
    low: { label: 'Optioneel', bg: Colors.greenBg, color: Colors.greenDark },
  }[urgency] || { label: '', bg: Colors.warmGray, color: Colors.slate };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

export default function ChecklistScreen() {
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
                <View style={styles.chapterTitleRow}>
                  <Text style={styles.chapterIcon}>{chapter.icon}</Text>
                  <View style={styles.chapterTitleContent}>
                    <Text style={styles.chapterLabel}>{chapter.label}</Text>
                    <Text style={styles.chapterDesc}>{chapter.description}</Text>
                  </View>
                </View>
                <View style={styles.chapterMeta}>
                  <Text style={[
                    styles.chapterCount,
                    chapterDone && styles.chapterCountDone,
                  ]}>
                    {chapterChecked}/{chapter.items.length}
                  </Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.chapterItems}>
                  {chapter.items.map((item) => {
                    const isChecked = checkedItems.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.checkItem, isChecked && styles.checkItemDone]}
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.checkRow}>
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
                              {item.actionLabel && !isChecked && (
                                <View style={styles.actionBadge}>
                                  <Text style={styles.actionBadgeText}>{item.actionLabel}</Text>
                                </View>
                              )}
                            </View>
                            {item.actionHint && !isChecked && (
                              <Text style={styles.actionHint}>{item.actionHint}</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
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
    backgroundColor: Colors.cream,
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
    fontWeight: '800',
    color: Colors.slate,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
  },
  completeBanner: {
    backgroundColor: Colors.greenBg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  completeText: {
    fontSize: FontSizes.body,
    color: Colors.greenDark,
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
  chapterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  chapterIcon: {
    fontSize: 24,
  },
  chapterTitleContent: {
    flex: 1,
    gap: 2,
  },
  chapterLabel: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  chapterDesc: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  chapterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  chapterCount: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    fontWeight: '600',
  },
  chapterCountDone: {
    color: Colors.greenDark,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.slateMuted,
  },
  chapterItems: {},
  checkItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.warmGray,
    padding: Spacing.lg,
  },
  checkItemDone: {
    backgroundColor: Colors.greenBg,
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
    borderColor: Colors.warmGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  checkmark: {
    color: Colors.white,
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
    color: Colors.slate,
  },
  checkTitleDone: {
    textDecorationLine: 'line-through',
    color: Colors.slateMuted,
  },
  checkDescription: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
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
    fontSize: 12,
    fontWeight: '600',
  },
  actionBadge: {
    backgroundColor: Colors.terracotta,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  actionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
  actionHint: {
    fontSize: FontSizes.small,
    color: Colors.terracotta,
    fontStyle: 'italic',
    marginTop: 2,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
