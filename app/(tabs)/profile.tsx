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
import { Ionicons } from '@expo/vector-icons';
import { loadState, AppState } from '../../src/store/appStore';
import { getFilteredChapters } from '../../src/data/checklist';
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
  const totalItems = chapters.reduce((sum, ch) => sum + ch.items.length, 0);
  const checkedCount = state.checkedItems?.length || 0;
  const contactsCount = state.contacts?.length || 0;

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
            router.replace('/');
          },
        },
      ]
    );
  }

  const situationItems = getSituationItems();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Instellingen</Text>
        </View>

        {/* Progress overview */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Voortgang</Text>
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
              <Text style={styles.statNumber}>{contactsCount}</Text>
              <Text style={styles.statLabel}>Contacten</Text>
            </View>
          </View>
        </Card>

        {/* Situation */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Jouw situatie</Text>
          {situationItems.map((item, i) => (
            <View key={i} style={styles.situationRow}>
              <Text style={styles.situationLabel}>{item.label}</Text>
              <Text style={styles.situationValue}>{item.value}</Text>
            </View>
          ))}
          {onboarding?.trustedPerson && (
            <View style={styles.situationRow}>
              <Text style={styles.situationLabel}>Vertrouwenspersoon</Text>
              <Text style={styles.situationValue}>
                {onboarding.trustedPerson.name}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push('/onboarding/questions')}
          >
            <Text style={styles.editLinkText}>Situatie aanpassen</Text>
          </TouchableOpacity>
        </Card>

        {/* Shared account */}
        <Card style={styles.sharedCard}>
          <Text style={styles.sharedTitle}>Gedeeld account</Text>
          <Text style={styles.sharedText}>
            Deel de toegang met je partner, kinderen of vertrouwenspersoon. Iedereen kan inloggen via het web en helpen met het regelen van zaken.
          </Text>
          <Button
            title="Uitnodiging versturen"
            onPress={() =>
              Alert.alert(
                'Binnenkort beschikbaar',
                'De deelfunctie is nog in ontwikkeling. Binnenkort kun je een uitnodiging versturen.'
              )
            }
            variant="outline"
            size="medium"
          />
        </Card>

        {/* About */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Over Geregeld</Text>
          <Text style={styles.aboutText}>
            Geregeld maakt het zo eenvoudig om je zaken te regelen dat het letterlijk 10 minuten kost.
          </Text>
          <Text style={styles.aboutSubtext}>Versie 1.0 · Gemaakt in Nederland</Text>
          <Text style={styles.aboutSubtext}>Qi Holdings</Text>
        </Card>

        {/* Danger zone */}
        <Button
          title="Alle gegevens wissen"
          onPress={handleReset}
          variant="outline"
          size="medium"
          style={{ marginTop: Spacing.md, borderColor: Colors.danger }}
          textStyle={{ color: Colors.danger }}
        />

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
    marginBottom: Spacing.lg,
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
    fontWeight: '700',
    color: Colors.text,
  },
  statsCard: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  statsTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
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
    fontWeight: '700',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.separator,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  situationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  situationLabel: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  situationValue: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  editLink: {
    marginTop: Spacing.sm,
  },
  editLinkText: {
    fontSize: FontSizes.body,
    color: Colors.accent,
    fontWeight: '600',
  },
  sharedCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderColor: 'rgba(45, 212, 191, 0.2)',
  },
  sharedTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.primary,
  },
  sharedText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  aboutText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  aboutSubtext: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
