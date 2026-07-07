import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, AppState, VaultItem, generateId } from '../../src/store/appStore';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

// A stored value is a hash when it's exactly 64 hex chars (SHA-256 output)
function isHashed(stored: string): boolean {
  return /^[a-f0-9]{64}$/i.test(stored);
}

export default function VaultScreen() {
  const [state, setState] = useState<AppState | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [confirmPin, setConfirmPin] = useState('');
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [addingItem, setAddingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'document' | 'password' | 'note'>('document');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(async (s) => {
        setState(s);
        if (!s.vaultPin) {
          setIsSettingPin(true);
        }
        setIsUnlocked(false);
        setPinInput('');
        setExpandedItem(null);

        // Check biometric availability
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(compatible && enrolled);
      });
    }, [])
  );

  if (!state) return null;

  async function handleBiometricAuth() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Ontgrendel je kluis',
      cancelLabel: 'Gebruik wachtwoord',
      disableDeviceFallback: true,
    });
    if (result.success) {
      setIsUnlocked(true);
    }
  }

  async function handleSetPin() {
    if (pinStep === 'enter') {
      if (pinInput.length < 6) {
        Alert.alert('Te kort', 'Je wachtwoord moet minimaal 6 tekens zijn voor maximale beveiliging.');
        return;
      }
      setConfirmPin(pinInput);
      setPinInput('');
      setPinStep('confirm');
      return;
    }

    if (pinInput !== confirmPin) {
      Alert.alert('Niet gelijk', 'De wachtwoorden komen niet overeen. Probeer opnieuw.');
      setPinInput('');
      setPinStep('enter');
      setConfirmPin('');
      return;
    }

    // Never store the password itself — only its SHA-256 hash
    const hashed = await hashPin(pinInput);
    await saveState({ vaultPin: hashed });
    setState((prev) => prev ? { ...prev, vaultPin: hashed } : prev);
    setIsSettingPin(false);
    setIsUnlocked(true);
    setPinInput('');
    setPinStep('enter');
  }

  async function handleUnlock() {
    const stored = state?.vaultPin;
    if (!stored) return;

    let matches = false;
    if (isHashed(stored)) {
      matches = (await hashPin(pinInput)) === stored;
    } else {
      // Legacy plaintext pin from an older version — verify and upgrade to a hash
      matches = pinInput === stored;
      if (matches) {
        const hashed = await hashPin(pinInput);
        await saveState({ vaultPin: hashed });
        setState((prev) => prev ? { ...prev, vaultPin: hashed } : prev);
      }
    }

    if (matches) {
      setIsUnlocked(true);
      setPinInput('');
    } else {
      Alert.alert('Onjuist wachtwoord', 'Probeer het opnieuw.');
      setPinInput('');
    }
  }

  async function handleAddItem() {
    if (!newTitle.trim()) return;
    const item: VaultItem = {
      id: generateId(),
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
    };
    const newItems = [...(state?.vaultItems || []), item];
    await saveState({ vaultItems: newItems });
    setState((prev) => prev ? { ...prev, vaultItems: newItems } : prev);
    setNewTitle('');
    setNewContent('');
    setAddingItem(false);
  }

  async function handleDeleteItem(id: string) {
    Alert.alert('Verwijderen', 'Weet je zeker dat je dit item wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: async () => {
          const newItems = (state?.vaultItems || []).filter((i) => i.id !== id);
          await saveState({ vaultItems: newItems });
          setState((prev) => prev ? { ...prev, vaultItems: newItems } : prev);
        },
      },
    ]);
  }

  const getCategoryIcon = (cat: string): any => {
    switch (cat) {
      case 'document': return 'document-text-outline';
      case 'password': return 'key-outline';
      case 'note': return 'create-outline';
      default: return 'document-outline';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'document': return 'Document';
      case 'password': return 'Wachtwoord';
      case 'note': return 'Notitie';
      default: return '';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'document': return Colors.primary;
      case 'password': return Colors.pink;
      case 'note': return Colors.warning;
      default: return Colors.textSecondary;
    }
  };

  // PIN setup screen
  if (isSettingPin) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.lockScreen} keyboardShouldPersistTaps="handled">
          <GradientCard colors={GRADIENT_PRESETS.cool}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="shield-checkmark" size={48} color={Colors.accent} />
            </View>
            <Text style={styles.lockTitle}>Kluis beveiligen</Text>
            <Text style={styles.lockSubtitle}>
              {pinStep === 'enter'
                ? 'Kies een sterk wachtwoord (min. 6 tekens) om je gevoelige documenten te beschermen.'
                : 'Voer je wachtwoord nogmaals in ter bevestiging.'}
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder={pinStep === 'enter' ? 'Kies wachtwoord' : 'Bevestig wachtwoord'}
              placeholderTextColor={Colors.textTertiary}
              value={pinInput}
              onChangeText={setPinInput}
              secureTextEntry
              autoFocus
            />
            <Button title={pinStep === 'enter' ? 'Volgende' : 'Kluis beveiligen'} onPress={handleSetPin} />

            <View style={styles.offlineWarning}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
              <Text style={styles.offlineWarningText}>
                Schrijf dit wachtwoord op en bewaar het op een veilige plek (bijv. in een kluis thuis). Dit wachtwoord kan niet worden hersteld.
              </Text>
            </View>
          </GradientCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Lock screen
  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.lockScreen} keyboardShouldPersistTaps="handled">
          <GradientCard colors={GRADIENT_PRESETS.soft}>
            <View style={styles.lockIconContainer}>
              <Ionicons name="lock-closed" size={48} color={Colors.accent} />
            </View>
            <Text style={styles.lockTitle}>Kluis</Text>
            <Text style={styles.lockSubtitle}>
              Ontgrendel met {hasBiometrics ? 'Face ID / vingerafdruk of ' : ''}je wachtwoord.
            </Text>

            {hasBiometrics && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricAuth} activeOpacity={0.7}>
                <Ionicons name="finger-print-outline" size={32} color={Colors.accent} />
                <Text style={styles.biometricText}>Ontgrendel met Face ID</Text>
              </TouchableOpacity>
            )}

            {hasBiometrics && (
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>of</Text>
                <View style={styles.dividerLine} />
              </View>
            )}

            <TextInput
              style={styles.pinInput}
              placeholder="Wachtwoord"
              placeholderTextColor={Colors.textTertiary}
              value={pinInput}
              onChangeText={setPinInput}
              secureTextEntry
              autoFocus={!hasBiometrics}
              onSubmitEditing={handleUnlock}
            />
            <Button title="Ontgrendelen" onPress={handleUnlock} />
          </GradientCard>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Unlocked vault
  const items = state.vaultItems || [];
  const documents = items.filter((i) => i.category === 'document');
  const passwords = items.filter((i) => i.category === 'password');
  const notes = items.filter((i) => i.category === 'note');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerLabel}>Beveiligd</Text>
              <Text style={styles.title}>Kluis</Text>
            </View>
            <TouchableOpacity onPress={() => setIsUnlocked(false)} style={styles.lockButton}>
              <Ionicons name="lock-open-outline" size={20} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add item */}
        {addingItem ? (
          <Card style={styles.addCard}>
            <Text style={styles.addTitle}>Nieuw item</Text>
            <View style={styles.categoryRow}>
              {(['document', 'password', 'note'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Ionicons name={getCategoryIcon(cat)} size={14} color={newCategory === cat ? Colors.primary : Colors.textTertiary} />
                  <Text style={[styles.categoryChipText, newCategory === cat && styles.categoryChipTextActive]}>
                    {getCategoryLabel(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Titel"
              placeholderTextColor={Colors.textTertiary}
              value={newTitle}
              onChangeText={setNewTitle}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Inhoud"
              placeholderTextColor={Colors.textTertiary}
              value={newContent}
              onChangeText={setNewContent}
              multiline
            />
            <View style={styles.addButtons}>
              <Button title="Opslaan" onPress={handleAddItem} size="medium" />
              <Button title="Annuleren" onPress={() => setAddingItem(false)} variant="outline" size="medium" />
            </View>
          </Card>
        ) : (
          <TouchableOpacity style={styles.addButtonWrap} onPress={() => setAddingItem(true)} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
            <Text style={styles.addButtonText}>Item toevoegen</Text>
          </TouchableOpacity>
        )}

        {items.length === 0 && !addingItem && (
          <GradientCard colors={GRADIENT_PRESETS.subtle}>
            <View style={styles.emptyContent}>
              <Ionicons name="shield-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>Je kluis is leeg</Text>
              <Text style={styles.emptyText}>
                Doorloop de stappen in 'Te Doen' — je gegevens worden automatisch hier opgeslagen.
              </Text>
            </View>
          </GradientCard>
        )}

        {[
          { title: 'Documenten', items: documents, cat: 'document' },
          { title: 'Wachtwoorden', items: passwords, cat: 'password' },
          { title: 'Notities', items: notes, cat: 'note' },
        ].filter((s) => s.items.length > 0).map((section) => (
          <View key={section.cat} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => {
              const isExpanded = expandedItem === item.id;
              const isPassword = item.category === 'password';
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => setExpandedItem(isExpanded ? null : item.id)}
                >
                  <Card style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <View style={[styles.itemIcon, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
                        <Ionicons name={getCategoryIcon(item.category)} size={18} color={getCategoryColor(item.category)} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {!isExpanded && item.content ? (
                          <Text style={styles.itemPreview}>
                            {isPassword ? '••••••••' : item.content.split('\n')[0]}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textTertiary}
                      />
                    </View>
                    {isExpanded && item.content ? (
                      <View style={styles.itemExpanded}>
                        <Text style={styles.itemFullContent}>{item.content}</Text>
                        <TouchableOpacity
                          onPress={() => handleDeleteItem(item.id)}
                          style={styles.deleteRow}
                        >
                          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                          <Text style={styles.deleteText}>Verwijderen</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

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
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.primary,
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
  lockButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockScreen: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  lockIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 87, 108, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  lockTitle: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  lockSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  biometricButton: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
    marginBottom: Spacing.md,
  },
  biometricText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.accent,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  pinInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSizes.large,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  offlineWarningText: {
    flex: 1,
    fontSize: FontSizes.small,
    color: Colors.warning,
    lineHeight: 20,
    fontWeight: FontWeights.medium,
  },
  addButtonWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.2)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },
  addCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  addTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.fill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(45, 212, 191, 0.1)',
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    fontWeight: FontWeights.medium,
  },
  categoryChipTextActive: {
    color: Colors.primary,
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
  contentInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButtons: {
    gap: Spacing.sm,
  },
  emptyContent: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: Colors.text,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  itemCard: {
    padding: Spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  itemPreview: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
  },
  itemExpanded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    gap: Spacing.md,
  },
  itemFullContent: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSizes.small,
    color: Colors.danger,
    fontWeight: FontWeights.medium,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
