import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GUIDE_STEPS } from '../../src/data/guide';

export default function GuideScreen() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Wat te doen bij een overlijden</Text>
          <Text style={styles.subtitle}>
            Een stap-voor-stap gids voor nabestaanden. Je hoeft dit niet alleen te doen.
          </Text>
        </View>

        <View style={styles.importantCard}>
          <Text style={styles.importantTitle}>💛 Het allerbelangrijkste</Text>
          <Text style={styles.importantText}>
            Neem de tijd om dit te verwerken. Deze stappen hoeven niet allemaal vandaag. Vraag hulp aan familie, vrienden of een uitvaartondernemer.
          </Text>
        </View>

        {GUIDE_STEPS.map((step) => {
          const isExpanded = expandedStep === step.step;
          return (
            <Card key={step.step} style={styles.stepCard}>
              <TouchableOpacity
                style={styles.stepHeader}
                onPress={() => setExpandedStep(isExpanded ? null : step.step)}
                activeOpacity={0.7}
              >
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.step}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepTiming}>{step.timing}</Text>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.stepDetails}>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                  {step.details.map((detail, i) => (
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
    marginTop: Spacing.md,
  },
  title: {
    fontSize: FontSizes.h2,
    fontWeight: '800',
    color: Colors.slate,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    lineHeight: 24,
  },
  importantCard: {
    backgroundColor: Colors.orangeBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
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
  stepCard: {
    marginBottom: Spacing.sm,
    padding: 0,
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: FontSizes.body,
    fontWeight: '700',
  },
  stepInfo: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    fontSize: FontSizes.body,
    fontWeight: '700',
    color: Colors.slate,
  },
  stepTiming: {
    fontSize: FontSizes.small,
    color: Colors.terracotta,
    fontWeight: '500',
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.slateMuted,
  },
  stepDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.warmGray,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  stepDescription: {
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
