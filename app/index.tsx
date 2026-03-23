import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { Button } from '../src/components/Button';
import { loadState } from '../src/store/appStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadState().then((state) => {
      if (state.hasCompletedOnboarding) {
        router.replace('/(tabs)/home');
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

        <View style={styles.valuePropsContainer}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.12)', 'rgba(45, 212, 191, 0.08)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.valuePropsGradient}
          >
            <View style={styles.valueProps}>
              <View style={styles.valueProp}>
                <Text style={styles.valuePropTitle}>10 min</Text>
                <Text style={styles.valuePropText}>Snel klaar</Text>
              </View>
              <View style={styles.valueDivider} />
              <View style={styles.valueProp}>
                <Text style={styles.valuePropTitle}>Gratis</Text>
                <Text style={styles.valuePropText}>Geen kosten</Text>
              </View>
              <View style={styles.valueDivider} />
              <View style={styles.valueProp}>
                <Text style={styles.valuePropTitle}>Veilig</Text>
                <Text style={styles.valuePropText}>100% prive</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.buttonSection}>
          <Button
            title="Begin met regelen"
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
    backgroundColor: Colors.background,
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
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: FontSizes.h2,
    color: Colors.accent,
    fontWeight: FontWeights.semibold,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  messageSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  mainMessage: {
    fontSize: FontSizes.h3,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: FontWeights.regular,
    letterSpacing: 0.2,
  },
  subMessage: {
    fontSize: FontSizes.h3,
    color: Colors.accent,
    textAlign: 'center',
    fontWeight: FontWeights.bold,
    marginTop: Spacing.xs,
  },
  valuePropsContainer: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  valuePropsGradient: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  valueProps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  valueProp: {
    alignItems: 'center',
    flex: 1,
  },
  valueDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.separator,
  },
  valuePropTitle: {
    fontSize: FontSizes.h3,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  valuePropText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontWeight: FontWeights.medium,
  },
  buttonSection: {
    alignItems: 'center',
  },
  buttonSubtext: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
});
