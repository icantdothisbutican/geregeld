import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { loadState, saveState, AppState } from '../../src/store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, [])
  );

  if (!state) return null;

  const situation = state.situation;

  function getSituationSummary() {
    const parts: string[] = [];
    if (situation.hasPartner) parts.push('Partner: Ja');
    else if (situation.hasPartner === false) parts.push('Partner: Nee');
    if (situation.hasChildren) parts.push('Kinderen: Ja');
    else if (situation.hasChildren === false) parts.push('Kinderen: Nee');
    if (situation.housingType) {
      parts.push(
        `Woning: ${situation.housingType === 'huur' ? 'Huur' : situation.housingType === 'koop' ? 'Koop' : 'Anders'}`
      );
    }
    return parts;
  }

  async function handleReset() {
    Alert.alert(
      'Alles resetten',
      'Weet je zeker dat je al je gegevens wilt wissen? Dit kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@geregeld_state');
            router.replace('/');
          },
        },
      ]
    );
  }

  const checkedCount = state.checkedItems?.length || 0;
  const contactsCount = state.contacts?.length || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Jouw Profiel</Text>
          <Text style={styles.subtitle}>Je voortgang en instellingen</Text>
        </View>

        {/* Progress overview */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Voortgang</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{checkedCount}</Text>
              <Text style={styles.statLabel}>Items afgevinkt</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{contactsCount}</Text>
              <Text style={styles.statLabel}>Contacten</Text>
            </View>
          </View>
        </Card>

        {/* Situation */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏠 Jouw situatie</Text>
          {getSituationSummary().map((item, i) => (
            <Text key={i} style={styles.situationItem}>
              {item}
            </Text>
          ))}
          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push('/onboarding/questions')}
          >
            <Text style={styles.editLinkText}>Situatie aanpassen →</Text>
          </TouchableOpacity>
        </Card>

        {/* Upgrade */}
        <Card style={{ ...styles.sectionCard, ...styles.upgradeCard }}>
          <Text style={styles.upgradeTitle}>⭐ Geregeld+</Text>
          <Text style={styles.upgradeText}>
            Ontgrendel de wachtwoordkluis, documentenkluis, onbeperkt contacten en meer.
          </Text>
          <View style={styles.upgradeFeatures}>
            <Text style={styles.upgradeFeature}>🔐 Wachtwoordkluis</Text>
            <Text style={styles.upgradeFeature}>📄 Documentenkluis</Text>
            <Text style={styles.upgradeFeature}>👥 Onbeperkt contacten</Text>
            <Text style={styles.upgradeFeature}>🤝 Vertrouwenspersoon</Text>
            <Text style={styles.upgradeFeature}>🔔 Jaarlijkse check-in</Text>
          </View>
          <Button
            title="Upgrade naar Geregeld+ — €5,99/maand"
            onPress={() =>
              Alert.alert(
                'Binnenkort beschikbaar',
                'Geregeld+ is nog in ontwikkeling. We laten je weten zodra het beschikbaar is!'
              )
            }
            variant="primary"
            size="medium"
          />
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                'Binnenkort beschikbaar',
                'De Voor Altijd optie is nog in ontwikkeling.'
              )
            }
          >
            <Text style={styles.lifetimeLink}>Of kies Geregeld Voor Altijd — €149 eenmalig</Text>
          </TouchableOpacity>
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ℹ️ Over Geregeld</Text>
          <Text style={styles.aboutText}>
            Geregeld maakt het zo eenvoudig om je zaken te regelen dat het letterlijk 10 minuten kost. Geen notaris nodig. Geen juridisch jargon.
          </Text>
          <Text style={styles.aboutSubtext}>
            Versie 1.0 · Gemaakt met ❤️ in Nederland
          </Text>
          <Text style={styles.aboutSubtext}>© Qi Holdings</Text>
        </Card>

        {/* Danger zone */}
        <Button
          title="Alle gegevens wissen"
          onPress={handleReset}
          variant="outline"
          size="medium"
          style={{ marginTop: Spacing.md }}
          textStyle={{ color: Colors.red }}
        />

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
    fontSize: FontSizes.h1,
    fontWeight: '800',
    color: Colors.slate,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
  },
  statsCard: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statsTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statNumber: {
    fontSize: FontSizes.h1,
    fontWeight: '800',
    color: Colors.terracotta,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.warmGray,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  situationItem: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
  },
  editLink: {
    marginTop: Spacing.sm,
  },
  editLinkText: {
    fontSize: FontSizes.body,
    color: Colors.terracotta,
    fontWeight: '600',
  },
  upgradeCard: {
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.terracotta,
  },
  upgradeTitle: {
    fontSize: FontSizes.h2,
    fontWeight: '800',
    color: Colors.slate,
  },
  upgradeText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    lineHeight: 24,
  },
  upgradeFeatures: {
    gap: Spacing.xs,
  },
  upgradeFeature: {
    fontSize: FontSizes.body,
    color: Colors.slate,
  },
  lifetimeLink: {
    fontSize: FontSizes.small,
    color: Colors.terracotta,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  aboutText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    lineHeight: 24,
  },
  aboutSubtext: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
