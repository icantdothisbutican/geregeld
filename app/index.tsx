import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { loadState } from '../src/store/appStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState().then((state) => {
      if (state.hasCompletedOnboarding) {
        router.replace('/(tabs)/checklist');
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.logo}>Geregeld</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.logo}>Geregeld</Text>
          <Text style={styles.tagline}>Heb je het geregeld?</Text>
        </View>

        <View style={styles.messageSection}>
          <Text style={styles.mainMessage}>
            Het mooiste dat je voor je naasten kunt doen, is zorgen dat zij zich kunnen richten op afscheid nemen.
          </Text>
          <Text style={styles.subMessage}>Niet op administratie.</Text>
        </View>

        <View style={styles.valueProps}>
          <View style={styles.valueProp}>
            <Text style={styles.valuePropIcon}>⏱️</Text>
            <Text style={styles.valuePropText}>Klaar in 10 minuten</Text>
          </View>
          <View style={styles.valueProp}>
            <Text style={styles.valuePropIcon}>🆓</Text>
            <Text style={styles.valuePropText}>Gratis te starten</Text>
          </View>
          <View style={styles.valueProp}>
            <Text style={styles.valuePropIcon}>🔒</Text>
            <Text style={styles.valuePropText}>Veilig & privé</Text>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Bekijk de checklist"
            onPress={() => router.push('/onboarding/questions')}
            variant="primary"
          />
          <Text style={styles.buttonSubtext}>Duurt 2 minuten. Helemaal gratis.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  logo: {
    fontSize: FontSizes.hero,
    fontWeight: '800',
    color: Colors.slate,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FontSizes.h2,
    color: Colors.terracotta,
    fontWeight: '600',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  mainMessage: {
    fontSize: FontSizes.h3,
    color: Colors.slate,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '500',
  },
  subMessage: {
    fontSize: FontSizes.h3,
    color: Colors.terracotta,
    textAlign: 'center',
    fontWeight: '700',
    marginTop: Spacing.xs,
  },
  valueProps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
  },
  valueProp: {
    alignItems: 'center',
    flex: 1,
  },
  valuePropIcon: {
    fontSize: 28,
    marginBottom: Spacing.xs,
  },
  valuePropText: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonSection: {
    alignItems: 'center',
  },
  buttonSubtext: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    marginTop: Spacing.sm,
  },
});
