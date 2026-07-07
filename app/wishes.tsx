import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { Card } from '../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../src/components/GradientCard';
import { ChoiceButton } from '../src/components/ChoiceButton';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, FuneralWishes, generateId } from '../src/store/appStore';
import { encryptContentIfPossible } from '../src/lib/vaultCrypto';

const DRESS_OPTIONS = ['Formeel (donkere kleding)', 'Casual', 'Kleurrijk', 'Geen voorkeur'];
const FLOWER_OPTIONS = ['Bloemen welkom', 'Donatie aan goed doel', 'Geen bloemen', 'Geen voorkeur'];
const CONDOLENCE_OPTIONS = ['Ja, met ontvangst', 'Ja, alleen online', 'Liever niet', 'Geen voorkeur'];

function wishesSummary(w: FuneralWishes): string {
  const lines: string[] = [];
  if (w.type) lines.push(`Type: ${w.type === 'crematie' ? 'Crematie' : 'Begraven'}`);
  if (w.location) lines.push(`Locatie: ${w.location}`);
  if (w.music.length) lines.push(`Muziek: ${w.music.join(', ')}`);
  if (w.speakers.length) lines.push(`Sprekers: ${w.speakers.join(', ')}`);
  if (w.dressCode) lines.push(`Dresscode: ${w.dressCode}`);
  if (w.flowers) lines.push(`Bloemen: ${w.flowers}`);
  if (w.condolence) lines.push(`Condoleance: ${w.condolence}`);
  if (w.specialWishes) lines.push(`Bijzondere wensen: ${w.specialWishes}`);
  return lines.join('\n');
}

export default function WishesScreen() {
  const router = useRouter();
  const [wishes, setWishes] = useState<FuneralWishes>({
    type: null,
    location: '',
    music: [],
    speakers: [],
    dressCode: '',
    flowers: '',
    condolence: '',
    specialWishes: '',
  });
  const [musicInput, setMusicInput] = useState('');
  const [speakerInput, setSpeakerInput] = useState('');
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        if (s.funeralWishes) setWishes(s.funeralWishes);
      });
    }, [])
  );

  function updateWishes(updates: Partial<FuneralWishes>) {
    setWishes((prev) => ({ ...prev, ...updates }));
    setSaved(false);
  }

  async function handleSave() {
    const state = await loadState();

    // Mark related checklist items done based on what was filled in
    const checked = new Set(state.checkedItems || []);
    if (wishes.type) checked.add('uit-1');
    if (wishes.location.trim()) checked.add('uit-2');
    if (wishes.music.length > 0 || wishes.speakers.length > 0) checked.add('uit-3');

    // Keep a copy in the vault so nabestaanden find it in one place
    const summary = wishesSummary(wishes);
    const vaultItems = [...(state.vaultItems || [])];
    if (summary) {
      const sealed = encryptContentIfPossible(state.vaultKeys, summary);
      const existing = vaultItems.find((v) => v.title === 'Uitvaartwensen');
      if (existing) {
        existing.content = sealed.content;
        existing.encrypted = sealed.encrypted;
        existing.createdAt = new Date().toISOString();
      } else {
        vaultItems.push({
          id: generateId(),
          title: 'Uitvaartwensen',
          category: 'document',
          content: sealed.content,
          encrypted: sealed.encrypted,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await saveState({
      funeralWishes: wishes,
      checkedItems: Array.from(checked),
      vaultItems,
    });
    setSaved(true);
  }

  function addMusic() {
    if (musicInput.trim()) {
      updateWishes({ music: [...wishes.music, musicInput.trim()] });
      setMusicInput('');
    }
  }

  function addSpeaker() {
    if (speakerInput.trim()) {
      updateWishes({ speakers: [...wishes.speakers, speakerInput.trim()] });
      setSpeakerInput('');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          <GradientCard colors={GRADIENT_PRESETS.warm} style={styles.headerCard}>
            <Text style={styles.title}>Uitvaartwensen</Text>
            <Text style={styles.subtitle}>
              Leg je wensen vast zodat je naasten niet hoeven te raden. Alles wordt veilig bewaard in je kluis.
            </Text>
          </GradientCard>

          {/* Type */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Crematie of begraven?</Text>
            <View style={styles.choiceRow}>
              <ChoiceButton
                label="Crematie"
                selected={wishes.type === 'crematie'}
                onPress={() => updateWishes({ type: 'crematie' })}
              />
              <ChoiceButton
                label="Begraven"
                selected={wishes.type === 'begraven'}
                onPress={() => updateWishes({ type: 'begraven' })}
              />
            </View>
          </Card>

          {/* Location */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Locatie</Text>
            <Text style={styles.sectionHint}>Kerk, aula, thuis, buiten, of een specifieke plek?</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. De Nieuwe Kerk, Amsterdam"
              placeholderTextColor={Colors.textTertiary}
              value={wishes.location}
              onChangeText={(t) => updateWishes({ location: t })}
            />
          </Card>

          {/* Music */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Muziek</Text>
            <Text style={styles.sectionHint}>Welke liedjes moeten gespeeld worden?</Text>
            {wishes.music.map((song, i) => (
              <View key={i} style={styles.listItem}>
                <Ionicons name="musical-notes-outline" size={16} color={Colors.primary} />
                <Text style={styles.listItemText}>{song}</Text>
                <TouchableOpacity
                  onPress={() => updateWishes({ music: wishes.music.filter((_, idx) => idx !== i) })}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Voeg een liedje toe..."
                placeholderTextColor={Colors.textTertiary}
                value={musicInput}
                onChangeText={setMusicInput}
                onSubmitEditing={addMusic}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addMusic} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color="#0B0B14" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Speakers */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sprekers</Text>
            <Text style={styles.sectionHint}>Wie mag of moet er spreken?</Text>
            {wishes.speakers.map((speaker, i) => (
              <View key={i} style={styles.listItem}>
                <Ionicons name="person-outline" size={16} color={Colors.primary} />
                <Text style={styles.listItemText}>{speaker}</Text>
                <TouchableOpacity
                  onPress={() => updateWishes({ speakers: wishes.speakers.filter((_, idx) => idx !== i) })}
                  style={styles.removeBtn}
                >
                  <Ionicons name="close" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Voeg een spreker toe..."
                placeholderTextColor={Colors.textTertiary}
                value={speakerInput}
                onChangeText={setSpeakerInput}
                onSubmitEditing={addSpeaker}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addSpeaker} activeOpacity={0.7}>
                <Ionicons name="add" size={24} color="#0B0B14" />
              </TouchableOpacity>
            </View>
          </Card>

          {/* Option groups */}
          {[
            { title: 'Dresscode', options: DRESS_OPTIONS, value: wishes.dressCode, key: 'dressCode' as const },
            { title: 'Bloemen', options: FLOWER_OPTIONS, value: wishes.flowers, key: 'flowers' as const },
            { title: 'Condoleance', options: CONDOLENCE_OPTIONS, value: wishes.condolence, key: 'condolence' as const },
          ].map((group) => (
            <Card key={group.key} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{group.title}</Text>
              <View style={styles.optionList}>
                {group.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.optionItem, group.value === option && styles.optionSelected]}
                    onPress={() => updateWishes({ [group.key]: option })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, group.value === option && styles.optionTextSelected]}>
                      {option}
                    </Text>
                    {group.value === option && (
                      <Ionicons name="checkmark" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ))}

          {/* Special wishes */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Bijzondere wensen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Heb je nog specifieke wensen? Bijv. een thema, specifieke tekst, of iets anders..."
              placeholderTextColor={Colors.textTertiary}
              value={wishes.specialWishes}
              onChangeText={(t) => updateWishes({ specialWishes: t })}
              multiline
              numberOfLines={4}
            />
          </Card>

          {saved ? (
            <View style={styles.savedBanner}>
              <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
              <Text style={styles.savedText}>Opgeslagen in je kluis</Text>
            </View>
          ) : (
            <Button title="Wensen opslaan" onPress={handleSave} variant="primary" />
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  headerCard: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
  },
  sectionCard: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sectionHint: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  input: {
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.fill,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  listItemText: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.text,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionList: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.fill,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  savedText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
