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
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { Card } from '../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../src/components/GradientCard';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, generateId } from '../src/store/appStore';
import { encryptContentIfPossible } from '../src/lib/vaultCrypto';

// Alles-in-1 prijs per kaart: drukwerk, envelop en PostNL-bezorging.
// Ter vergelijking: zelf doen kost al snel 4 tot 5 euro per kaart.
const PRICE_PER_CARD = 3.95;

type TemplateKey = 'klassiek' | 'modern' | 'natuur' | 'sereen';

interface Template {
  key: TemplateKey;
  label: string;
  bg: string[]; // achtergrond-gradient van de kaart
  ink: string; // tekstkleur
  inkSoft: string; // zachtere tekstkleur
  serif: boolean; // sierlijke letter voor de naam
  accents: string[]; // keuze aan accentkleuren
}

const TEMPLATES: Template[] = [
  {
    key: 'klassiek',
    label: 'Klassiek',
    bg: ['#FBF8F2', '#F2ECE0'],
    ink: '#2A2620',
    inkSoft: '#6B6355',
    serif: true,
    accents: ['#3D3A34', '#7C6F5A', '#5A6B57'],
  },
  {
    key: 'modern',
    label: 'Modern',
    bg: ['#EEF1F6', '#E2E7F0'],
    ink: '#1E2530',
    inkSoft: '#5C6674',
    serif: false,
    accents: ['#4A6B8A', '#8A6D9E', '#3F8A8A'],
  },
  {
    key: 'natuur',
    label: 'Natuur',
    bg: ['#EEF3E8', '#DFEAD4'],
    ink: '#2C3A26',
    inkSoft: '#5E6B54',
    serif: true,
    accents: ['#5A7B4E', '#7A8B4A', '#4E7B6B'],
  },
  {
    key: 'sereen',
    label: 'Sereen',
    bg: ['#26242E', '#1B1A22'],
    ink: '#F2EFE8',
    inkSoft: '#B8B2A6',
    serif: true,
    accents: ['#C9A96A', '#A88FB0', '#8FA8B8'],
  },
];

interface Recipient {
  id: string;
  name: string;
  address: string;
}

// Live voorbeeld van de kaart, zoals hij gedrukt wordt
function CardPreview({
  template,
  accent,
  name,
  dates,
  message,
}: {
  template: Template;
  accent: string;
  name: string;
  dates: string;
  message: string;
}) {
  return (
    <View style={previewStyles.shadow}>
      <LinearGradient
        colors={template.bg as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={previewStyles.card}
      >
        <View style={[previewStyles.rule, { backgroundColor: accent }]} />
        <Text style={[previewStyles.inMemory, { color: template.inkSoft }]}>
          In liefdevolle herinnering
        </Text>
        <Text
          style={[
            previewStyles.name,
            { color: template.ink, fontStyle: template.serif ? 'italic' : 'normal' },
          ]}
          numberOfLines={2}
        >
          {name.trim() || 'Voornaam Achternaam'}
        </Text>
        {dates.trim() ? (
          <Text style={[previewStyles.dates, { color: template.inkSoft }]}>{dates.trim()}</Text>
        ) : (
          <Text style={[previewStyles.dates, { color: template.inkSoft }]}>1950 - 2025</Text>
        )}
        <View style={[previewStyles.divider, { backgroundColor: accent }]} />
        <Text style={[previewStyles.message, { color: template.inkSoft }]} numberOfLines={4}>
          {message.trim() || 'Een persoonlijke tekst, gedicht of citaat komt hier.'}
        </Text>
      </LinearGradient>
    </View>
  );
}

export default function CardsScreen() {
  const router = useRouter();
  const [templateKey, setTemplateKey] = useState<TemplateKey>('klassiek');
  const [accent, setAccent] = useState(TEMPLATES[0].accents[0]);
  const [name, setName] = useState('');
  const [dates, setDates] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const template = TEMPLATES.find((t) => t.key === templateKey)!;

  useFocusEffect(
    useCallback(() => {
      setSubmitted(false);
      // Vul de naam voor uit het profiel als hij nog leeg is
      loadState().then((s) => {
        if (s.onboarding?.name) setName((prev) => prev || s.onboarding.name);
      });
    }, [])
  );

  function pickTemplate(t: Template) {
    setTemplateKey(t.key);
    // Reset accent naar de eerste van het nieuwe sjabloon
    setAccent(t.accents[0]);
  }

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

    const listText = [
      `Ontwerp: ${template.label}`,
      `Naam: ${name.trim()}`,
      dates.trim() ? `Data: ${dates.trim()}` : '',
      message.trim() ? `Tekst: ${message.trim()}` : '',
      '',
      'Verzendlijst:',
      ...recipients.map((r) => `${r.name}, ${r.address}`),
    ].filter(Boolean).join('\n');

    const sealed = encryptContentIfPossible(state.vaultKeys, listText);
    const vaultItems = [...(state.vaultItems || [])];
    const existing = vaultItems.find((v) => v.title === 'Rouwkaart ontwerp');
    if (existing) {
      existing.content = sealed.content;
      existing.encrypted = sealed.encrypted;
      existing.createdAt = new Date().toISOString();
    } else {
      vaultItems.push({
        id: generateId(),
        title: 'Rouwkaart ontwerp',
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
            <Text style={styles.confirmTitle}>Je kaart staat klaar</Text>
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

          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>Ontwerp je eigen</Text>
            <Text style={styles.title}>Rouwkaart</Text>
            <Text style={styles.subtitle}>
              Kies een sjabloon en maak het je eigen. Je ziet direct hoe de kaart eruitziet.
            </Text>
          </View>

          {/* Live voorbeeld */}
          <CardPreview
            template={template}
            accent={accent}
            name={name}
            dates={dates}
            message={message}
          />

          {/* Sjabloon */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Sjabloon</Text>
            <View style={styles.templateRow}>
              {TEMPLATES.map((t) => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.templateChip, templateKey === t.key && styles.templateChipActive]}
                  onPress={() => pickTemplate(t)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={t.bg as [string, string]}
                    style={styles.templateSwatch}
                  />
                  <Text style={[styles.templateLabel, templateKey === t.key && styles.templateLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Accentkleur</Text>
            <View style={styles.accentRow}>
              {template.accents.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setAccent(c)}
                  style={[
                    styles.accentDot,
                    { backgroundColor: c },
                    accent === c && styles.accentDotActive,
                  ]}
                  activeOpacity={0.8}
                />
              ))}
            </View>
          </Card>

          {/* Teksten */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Teksten</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Naam</Text>
              <TextInput
                style={styles.input}
                placeholder="Voornaam Achternaam"
                placeholderTextColor={Colors.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Data (optioneel)</Text>
              <TextInput
                style={styles.input}
                placeholder="Bijv. 3 mei 1950 - 12 maart 2025"
                placeholderTextColor={Colors.textTertiary}
                value={dates}
                onChangeText={setDates}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Persoonlijke tekst</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Een gedicht, citaat of eigen woorden..."
                placeholderTextColor={Colors.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
              />
            </View>
          </Card>

          {/* Verzendlijst */}
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

const previewStyles = StyleSheet.create({
  shadow: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  card: {
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    minHeight: 340,
    justifyContent: 'center',
  },
  rule: {
    width: 40,
    height: 3,
    borderRadius: 2,
    marginBottom: Spacing.lg,
  },
  inMemory: {
    fontSize: FontSizes.small,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.md,
  },
  name: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  dates: {
    fontSize: FontSizes.body,
    marginTop: Spacing.sm,
  },
  divider: {
    width: 60,
    height: 1,
    marginVertical: Spacing.lg,
    opacity: 0.6,
  },
  message: {
    fontSize: FontSizes.body,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },
});

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
  headerText: {
    marginBottom: Spacing.lg,
  },
  headerLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
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
  templateRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  templateChip: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  templateChipActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  templateSwatch: {
    width: '100%',
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  templateLabel: {
    fontSize: FontSizes.caption,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  templateLabelActive: {
    color: Colors.primary,
  },
  accentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  accentDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accentDotActive: {
    borderColor: '#fff',
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  fieldLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
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
