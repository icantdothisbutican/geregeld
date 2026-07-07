import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, AppState } from '../../src/store/appStore';
import { getFilteredChapters } from '../../src/data/checklist';
import { GUIDE_STEPS } from '../../src/data/guide';
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
  const onboarding = state.onboarding;
  const chapters = getFilteredChapters(situation, onboarding);
  const allItems = chapters.flatMap((ch) => ch.items);
  const totalItems = allItems.length + GUIDE_STEPS.length;
  const validIds = new Set([
    ...allItems.map((item) => item.id),
    ...GUIDE_STEPS.map((s) => `guide-step-${s.step}`),
  ]);
  const checkedCount = (state.checkedItems || []).filter((id) => validIds.has(id)).length;
  const vaultCount = state.vaultItems?.length || 0;

  function getSituationItems(): { label: string; value: string }[] {
    const items: { label: string; value: string }[] = [];
    if (onboarding?.name) items.push({ label: 'Naam', value: onboarding.name });
    if (onboarding?.ageRange) items.push({ label: 'Leeftijd', value: onboarding.ageRange });
    if (situation.hasPartner !== null) items.push({ label: 'Partner', value: situation.hasPartner ? 'Ja' : 'Nee' });
    if (situation.hasChildren !== null) items.push({ label: 'Kinderen', value: situation.hasChildren ? 'Ja' : 'Nee' });
    if (situation.housingType) {
      const housing = situation.housingType === 'huur' ? 'Huur' : situation.housingType === 'koop' ? 'Koop' : 'Anders';
      items.push({ label: 'Woning', value: housing });
    }
    if (onboarding?.address) items.push({ label: 'Adres', value: onboarding.address });
    if (onboarding?.hasTestament) {
      const testament = onboarding.hasTestament === 'ja' ? 'Ja' : onboarding.hasTestament === 'nee' ? 'Nee' : 'Weet niet';
      items.push({ label: 'Testament', value: testament });
    }
    if (onboarding?.preferenceMode) {
      items.push({ label: 'Voorkeur', value: onboarding.preferenceMode === 'digitaal' ? 'Digitaal' : 'Op papier' });
    }
    return items;
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
            await AsyncStorage.removeItem('@geregeld_state_v2');
            // Wis ook de kluis-sleutel uit de hardware-keychain
            if (Platform.OS !== 'web') {
              try { await SecureStore.deleteItemAsync('geregeld_vault_key'); } catch {}
            }
            router.replace('/');
          },
        },
      ]
    );
  }

  async function handleShare() {
    if (!state) return;
    const name = state.onboarding?.name || 'Ik';
    const trusted = state.onboarding?.trustedPerson;

    const chapterLines = chapters.map((ch) => {
      const done = ch.items.filter((i) => (state.checkedItems || []).includes(i.id)).length;
      const mark = done === ch.items.length ? 'klaar' : `${done}/${ch.items.length}`;
      return `- ${ch.label}: ${mark}`;
    });

    // Bewust GEEN kluis-inhoud, wachtwoorden of details — alleen dat het er is
    const message = [
      `${name} heeft het geregeld — via de Geregeld-app.`,
      '',
      `Voortgang: ${checkedCount} van ${totalItems} zaken geregeld.`,
      '',
      ...chapterLines,
      '',
      `Er staan ${vaultCount} items veilig versleuteld in de kluis (documenten, wachtwoorden en persoonlijke berichten).`,
      trusted ? `Vertrouwenspersoon: ${trusted.name}${trusted.relation ? ` (${trusted.relation})` : ''}.` : '',
      '',
      'Als er iets gebeurt: open de Geregeld-app. De gids "Bij een overlijden" helpt je stap voor stap.',
    ].filter((line) => line !== undefined).join('\n');

    try {
      await Share.share({ message });
    } catch {
      // Web zonder navigator.share: kopieer naar klembord als vangnet
      await Clipboard.setStringAsync(message);
      Alert.alert('Gekopieerd', 'Het overzicht staat op je klembord. Plak het in een bericht naar je vertrouwenspersoon.');
    }
  }

  const situationItems = getSituationItems();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Instellingen</Text>
        </View>

        {/* Progress overview */}
        <GradientCard colors={GRADIENT_PRESETS.cool} style={styles.statsCardOuter}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{checkedCount}</Text>
              <Text style={styles.statLabel}>Afgevinkt</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalItems - checkedCount}</Text>
              <Text style={styles.statLabel}>Te doen</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{vaultCount}</Text>
              <Text style={styles.statLabel}>In kluis</Text>
            </View>
          </View>
        </GradientCard>

        {/* Situation */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Persoonlijk</Text>
          <Text style={styles.sectionTitle}>Jouw situatie</Text>
          {situationItems.map((item, i) => (
            <View key={i} style={[styles.situationRow, i > 0 && styles.situationRowBorder]}>
              <Text style={styles.situationLabel}>{item.label}</Text>
              <Text style={styles.situationValue}>{item.value}</Text>
            </View>
          ))}
          {onboarding?.trustedPerson && (
            <View style={[styles.situationRow, styles.situationRowBorder]}>
              <Text style={styles.situationLabel}>Vertrouwenspersoon</Text>
              <Text style={styles.situationValue}>{onboarding.trustedPerson.name}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push('/onboarding/questions')}
          >
            <Text style={styles.editLinkText}>Aanpassen</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
          </TouchableOpacity>
        </Card>

        {/* Share overview */}
        <GradientCard colors={GRADIENT_PRESETS.soft} style={styles.sharedCardOuter}>
          <Text style={styles.sharedTitle}>Deel met je vertrouwenspersoon</Text>
          <Text style={styles.sharedText}>
            Stuur een overzicht van wat je geregeld hebt — zonder wachtwoorden of andere geheimen. Zo weet je naaste dat alles klaarstaat.
          </Text>
          <Button
            title="Deel overzicht"
            onPress={handleShare}
            variant="outline"
            size="medium"
          />
        </GradientCard>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Over Geregeld</Text>
          <Text style={styles.aboutText}>
            Geregeld maakt het zo eenvoudig om je zaken te regelen dat het letterlijk 10 minuten kost.
          </Text>
          <View style={styles.aboutMeta}>
            <Text style={styles.aboutSubtext}>Versie 1.0</Text>
            <Text style={styles.aboutDot}>·</Text>
            <Text style={styles.aboutSubtext}>Gemaakt in Nederland</Text>
          </View>
          <Text style={styles.aboutSubtext}>Qi Holdings</Text>
        </Card>

        {/* Danger zone */}
        <TouchableOpacity style={styles.dangerButton} onPress={handleReset} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          <Text style={styles.dangerText}>Alle gegevens wissen</Text>
        </TouchableOpacity>

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
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  statsCardOuter: {
    marginBottom: Spacing.lg,
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
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sectionCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionLabel: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  situationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  situationRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  situationLabel: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  situationValue: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  editLinkText: {
    fontSize: FontSizes.body,
    color: Colors.accent,
    fontWeight: FontWeights.semibold,
  },
  sharedCardOuter: {
    marginBottom: Spacing.md,
  },
  sharedTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  sharedText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  aboutText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  aboutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aboutDot: {
    color: Colors.textTertiary,
  },
  aboutSubtext: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    marginTop: Spacing.md,
  },
  dangerText: {
    fontSize: FontSizes.body,
    color: Colors.danger,
    fontWeight: FontWeights.semibold,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
