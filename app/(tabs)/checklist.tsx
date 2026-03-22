import React, { useEffect, useState, useCallback } from 'react';
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
import {
  getFilteredChecklist,
  ChecklistItem,
  CATEGORIES,
} from '../../src/data/checklist';

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
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        setState(s);
        setItems(getFilteredChecklist(s.situation));
      });
    }, [])
  );

  if (!state) return null;

  const checkedItems = state.checkedItems || [];
  const progress = items.length > 0 ? checkedItems.length / items.length : 0;

  async function toggleItem(itemId: string) {
    const newChecked = checkedItems.includes(itemId)
      ? checkedItems.filter((id) => id !== itemId)
      : [...checkedItems, itemId];
    await saveState({ checkedItems: newChecked });
    setState((prev) => prev ? { ...prev, checkedItems: newChecked } : prev);
  }

  const groupedItems = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.category === cat.key),
  })).filter((group) => group.items.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Jouw Checklist</Text>
          <Text style={styles.subtitle}>
            {items.length - checkedItems.length} van {items.length} dingen om te regelen
          </Text>
          <ProgressBar progress={progress} />
          {progress === 1 && (
            <View style={styles.completeBanner}>
              <Text style={styles.completeText}>🎉 Alles geregeld! Goed bezig.</Text>
            </View>
          )}
        </View>

        {groupedItems.map((group) => {
          const isExpanded = expandedCategory === group.key;
          const groupChecked = group.items.filter((i) => checkedItems.includes(i.id)).length;

          return (
            <Card key={group.key} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : group.key)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryIcon}>{group.icon}</Text>
                  <Text style={styles.categoryLabel}>{group.label}</Text>
                </View>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryCount}>
                    {groupChecked}/{group.items.length}
                  </Text>
                  <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </View>
              </TouchableOpacity>

              {isExpanded &&
                group.items.map((item) => {
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
                          <UrgencyBadge urgency={item.urgency} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
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
  categoryCard: {
    marginBottom: Spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryCount: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.slateMuted,
  },
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
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
