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
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, generateId } from '../src/store/appStore';
import { encryptContentIfPossible } from '../src/lib/vaultCrypto';

// Alles-in-1 prijs per kaart: drukwerk, envelop en PostNL-bezorging.
// Ter vergelijking: zelf doen kost al snel 4 tot 5 euro per kaart
// (kaart 1,50-2,00 + postzegel 1,21 + envelop + naar de brievenbus).
const PRICE_PER_CARD = 3.95;

const DESIGNS = [
  { key: 'klassiek', label: 'Klassiek', desc: 'Wit met sierlijke rand' },
  { key: 'modern', label: 'Modern', desc: 'Minimalistisch en rustig' },
  { key: 'natuur', label: 'Natuur', desc: 'Zachte bloemen' },
  { key: 'persoonlijk', label: 'Persoonlijk', desc: 'Met eigen foto' },
];

interface Recipient {
  id: string;
  name: string;
  address: string;
}

export default function CardsScreen() {
  const router = useRouter();
  const [design, setDesign] = useState('klassiek');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setSubmitted(false);
    }, [])
  );

  function addRecipient() {
    if (!newName.trim() || !newAddress.trim()) return;
    setRecipients((prev) => [
      ...prev,
      { id: generateId(), name: newName.trim(), address: newAddress.trim() },
    ]);
    setNewName('');
    setNewAddress('');
  }

  function removeRecipient(id: string) {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  const total = recipients.length * PRICE_PER_CARD;
  const totalFormatted = total.toFixed(2).replace('.', ',');

  async function handleSubmit() {
    const state = await loadState();

    // Bewaar de verzendlijst versleuteld in de kluis, zodat hij klaarstaat
    // op het moment dat nabestaanden hem nodig hebben
    const listText = [
      `Ontwerp: ${DESIGNS.find((d) => d.key === design)?.label}`,
      message.trim() ? `Boodschap: ${message.trim()}` : '',
      '',
      'Verzendlijst:',
      ...recipients.map((r) => `${r.name}, ${r.address}`),
    ].filter(Boolean).join('\n');

    const sealed = encryptContentIfPossible(state.vaultKeys, listText);
    const vaultItems = [...(state.vaultItems || [])];
    const existing = vaultItems.find((v) => v.title === 'Rouwkaarten verzendlijst');
    if (existing) {
      existing.content = sealed.content;
      existing.encrypted = sealed.encrypted;
      existing.createdAt = new Date().toISOString();
    } else {
      vaultItems.push({
        id: generateId(),
        title: 'Rouwkaarten verzendlijst',
        category: 'document',
        content: sealed.content,
        encrypted: sealed.encrypted,
        createdAt: new Date().toISOString(),
      });
    }

    const checked = new Set(state.checkedItems || []);
    checked.add('con-2');

    await saveState({ vaultItems, checkedItems: Array.from(checked) });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.confirmWrap}>
          <GradientCard colors={GRADIENT_PRESETS.cool}>
            <View style={styles.confirmIcon}>
              <Ionicons name="checkmark-circle" size={56} color="#fff" />
            </View>
            <Text style={styles.confirmTitle}>Alles staat klaar</Text>
            <Text style={styles.confirmText}>
              Je ontwerp en verzendlijst zijn veilig opgeslagen in je kluis. Zodra het nodig is, verstuurt je vertrouwenspersoon de kaarten met een druk op de knop via PostNL.
            </Text>
            <Button title="Terug" onPress={() => router.back()} variant="primary" />
          </GradientCard>
        </View>
      </SafeAreaView>
    );
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
            <Text style={styles.title}>Rouwkaarten</Text>
            <Text style={styles.subtitle}>
              Bereid alles nu voor. Later versturen je nabestaanden de kaarten met een druk op de knop: wij drukken, adresseren en bezorgen via PostNL.
            </Text>
          </GradientCard>

          {/* Ontwerp */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Kies een ontwerp</Text>
            <View style={styles.designGrid}>
              {DESIGNS.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.designOption, design === d.key && styles.designSelected]}
                  onPress={() => setDesign(d.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.designLabel, design === d.key && styles.designLabelSelected]}>
                    {d.label}
                  </Text>
                  <Text style={styles.designDesc}>{d.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Boodschap */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tekst op de kaart</Text>
            <Text style={styles.sectionHint}>Optioneel. Nabestaanden kunnen dit later aanvullen.</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Bijv. een gedicht, citaat of persoonlijke tekst..."
              placeholderTextColor={Colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
            />
          </Card>

          {/* Ontvangers */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Verzendlijst</Text>
            <Text style={styles.sectionHint}>
              Wie moet een kaart ontvangen? Naam en adres is genoeg.
            </Text>

            {recipients.map((r) => (
              <View key={r.id} style={styles.recipientRow}>
                <Ionicons name="mail-outline" size={16} color={Colors.primary} />
                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName}>{r.name}</Text>
                  <Text style={styles.recipientAddress}>{r.address}</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecipient(r.id)} style={styles.removeBtn}>
                  <Ionicons name="close" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            <TextInput
              style={styles.input}
              placeholder="Naam"
              placeholderTextColor={Colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={styles.input}
              placeholder="Straat, huisnummer, postcode, plaats"
              placeholderTextColor={Colors.textTertiary}
              value={newAddress}
              onChangeText={setNewAddress}
              onSubmitEditing={addRecipient}
            />
            <Button
              title="Ontvanger toevoegen"
              onPress={addRecipient}
              variant="outline"
              size="medium"
            />
          </Card>

          {/* Prijs */}
          {recipients.length > 0 && (
            <Card style={styles.sectionCard}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {recipients.length} {recipients.length === 1 ? 'kaart' : 'kaarten'} x {'€'}3,95
                </Text>
                <Text style={styles.priceTotal}>{'€'}{totalFormatted}</Text>
              </View>
              <Text style={styles.priceHint}>
                Alles inbegrepen: drukwerk, envelop en bezorging via PostNL. Je betaalt pas bij het daadwerkelijk versturen.
              </Text>
            </Card>
          )}

          <Button
            title={recipients.length > 0 ? 'Klaarzetten voor versturen' : 'Voeg eerst ontvangers toe'}
            onPress={handleSubmit}
            disabled={recipients.length === 0}
            variant="primary"
          />

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    color: 'rgba(255, 255, 255, 0.85)',
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
  designGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  designOption: {
    flexBasis: '47%',
    flexGrow: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.fill,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  designSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  designLabel: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  designLabelSelected: {
    color: Colors.primary,
  },
  designDesc: {
    fontSize: FontSizes.caption,
    color: Colors.textTertiary,
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
    minHeight: 90,
    textAlignVertical: 'top',
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.fill,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  recipientInfo: {
    flex: 1,
    gap: 1,
  },
  recipientName: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  recipientAddress: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
  },
  priceTotal: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
  },
  priceHint: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    lineHeight: 19,
  },
  confirmWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  confirmIcon: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  confirmTitle: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  confirmText: {
    fontSize: FontSizes.body,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: Spacing.lg,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
