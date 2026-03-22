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
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { ChoiceButton } from '../../src/components/ChoiceButton';
import { Button } from '../../src/components/Button';
import { loadState, saveState, FuneralWishes } from '../../src/store/appStore';

const DRESS_OPTIONS = ['Formeel (donkere kleding)', 'Casual', 'Kleurrijk', 'Geen voorkeur'];
const FLOWER_OPTIONS = ['Bloemen welkom', 'Donatie aan goed doel', 'Geen bloemen', 'Geen voorkeur'];
const CONDOLENCE_OPTIONS = ['Ja, met ontvangst', 'Ja, alleen online', 'Liever niet', 'Geen voorkeur'];

export default function WishesScreen() {
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
  const [hasChanges, setHasChanges] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        if (s.funeralWishes) setWishes(s.funeralWishes);
      });
    }, [])
  );

  function updateWishes(updates: Partial<FuneralWishes>) {
    setWishes((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }

  async function handleSave() {
    await saveState({ funeralWishes: wishes });
    setHasChanges(false);
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Uitvaartwensen</Text>
            <Text style={styles.subtitle}>
              Leg je wensen vast zodat je naasten niet hoeven te raden.
            </Text>
          </View>

          {/* Type */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🕯️ Crematie of begraven?</Text>
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
            <Text style={styles.sectionTitle}>📍 Locatie</Text>
            <Text style={styles.sectionHint}>Kerk, aula, thuis, buiten, of een specifieke plek?</Text>
            <TextInput
              style={styles.input}
              placeholder="Bijv. 'De Nieuwe Kerk, Amsterdam'"
              placeholderTextColor={Colors.slateMuted}
              value={wishes.location}
              onChangeText={(t) => updateWishes({ location: t })}
            />
          </Card>

          {/* Music */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎵 Muziek</Text>
            <Text style={styles.sectionHint}>Welke liedjes moeten gespeeld worden?</Text>
            {wishes.music.map((song, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemText}>🎵 {song}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateWishes({ music: wishes.music.filter((_, idx) => idx !== i) })
                  }
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Voeg een liedje toe..."
                placeholderTextColor={Colors.slateMuted}
                value={musicInput}
                onChangeText={setMusicInput}
                onSubmitEditing={addMusic}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addMusic}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Speakers */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🎤 Sprekers</Text>
            <Text style={styles.sectionHint}>Wie mag of moet er spreken?</Text>
            {wishes.speakers.map((speaker, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={styles.listItemText}>👤 {speaker}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateWishes({ speakers: wishes.speakers.filter((_, idx) => idx !== i) })
                  }
                >
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.addRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Voeg een spreker toe..."
                placeholderTextColor={Colors.slateMuted}
                value={speakerInput}
                onChangeText={setSpeakerInput}
                onSubmitEditing={addSpeaker}
              />
              <TouchableOpacity style={styles.addBtn} onPress={addSpeaker}>
                <Text style={styles.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Dress code */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>👔 Dresscode</Text>
            <View style={styles.optionList}>
              {DRESS_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionItem, wishes.dressCode === option && styles.optionSelected]}
                  onPress={() => updateWishes({ dressCode: option })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      wishes.dressCode === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Flowers */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>💐 Bloemen</Text>
            <View style={styles.optionList}>
              {FLOWER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionItem, wishes.flowers === option && styles.optionSelected]}
                  onPress={() => updateWishes({ flowers: option })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      wishes.flowers === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Condolence */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>🤝 Condoleance</Text>
            <View style={styles.optionList}>
              {CONDOLENCE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    wishes.condolence === option && styles.optionSelected,
                  ]}
                  onPress={() => updateWishes({ condolence: option })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      wishes.condolence === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Special wishes */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>✨ Bijzondere wensen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Heb je nog specifieke wensen? Bijv. een thema, specifieke tekst, of iets anders..."
              placeholderTextColor={Colors.slateMuted}
              value={wishes.specialWishes}
              onChangeText={(t) => updateWishes({ specialWishes: t })}
              multiline
              numberOfLines={4}
            />
          </Card>

          {hasChanges && (
            <Button
              title="Wensen opslaan"
              onPress={handleSave}
              variant="primary"
              style={{ marginTop: Spacing.md }}
            />
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
    lineHeight: 24,
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
  sectionHint: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSizes.body,
    color: Colors.slate,
    borderWidth: 1,
    borderColor: Colors.warmGray,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  listItemText: {
    fontSize: FontSizes.body,
    color: Colors.slate,
  },
  removeBtn: {
    fontSize: 18,
    color: Colors.red,
    fontWeight: '600',
    paddingHorizontal: Spacing.sm,
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
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '700',
  },
  optionList: {
    gap: Spacing.sm,
  },
  optionItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.warmGray,
  },
  optionSelected: {
    backgroundColor: Colors.greenBg,
    borderColor: Colors.green,
  },
  optionText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
  },
  optionTextSelected: {
    color: Colors.greenDark,
    fontWeight: '600',
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
