import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../../src/components/GradientCard';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, AppState, VaultItem, generateId } from '../../src/store/appStore';
import {
  createVaultKeys,
  unlockWithPassword,
  sealWithPublicKey,
  openSealed,
  bytesToHex,
  hexToBytes,
} from '../../src/lib/vaultCrypto';

// Sleutel waaronder de prive-sleutel in de hardware-keychain staat,
// zodat Face ID / vingerafdruk kan ontgrendelen zonder wachtwoord.
const SECURE_STORE_KEY = 'geregeld_vault_key';

async function hashPin(pin: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

function isHashed(stored: string): boolean {
  return /^[a-f0-9]{64}$/i.test(stored);
}

/** Versleutelt alle plaintext-items (uit oudere versies of pre-setup writes). */
function encryptPlaintextItems(
  items: VaultItem[],
  publicKeyHex: string
): { items: VaultItem[]; changed: boolean } {
  let changed = false;
  const out = items.map((item) => {
    if (!item.encrypted && item.content) {
      changed = true;
      return {
        ...item,
        content: sealWithPublicKey(publicKeyHex, item.content),
        encrypted: true,
      };
    }
    return item;
  });
  return { items: out, changed };
}

async function storeKeyForBiometrics(privateKey: Uint8Array) {
  if (Platform.OS === 'web') return;
  try {
    await SecureStore.setItemAsync(SECURE_STORE_KEY, bytesToHex(privateKey));
  } catch {
    // Keychain niet beschikbaar (bijv. simulator zonder passcode), geen ramp,
    // wachtwoord-unlock blijft werken.
  }
}

export default function VaultScreen() {
  const [state, setState] = useState<AppState | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [busy, setBusy] = useState(false);
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const privKeyRef = useRef<Uint8Array | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadState().then(async (s) => {
        setState(s);
        setIsSettingPin(!s.vaultKeys && !s.vaultPin);
        // Vergrendel bij elk bezoek: sleutel uit geheugen wissen
        privKeyRef.current = null;
        setIsUnlocked(false);
        setPinInput('');
        setExpandedItem(null);
        setCopiedId(null);

        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(Platform.OS !== 'web' && compatible && enrolled);
      });
    }, [])
  );

  // Ontsleutelde inhoud per item-id, alleen berekend wanneer ontgrendeld
  const decrypted = useMemo(() => {
    const map: Record<string, string> = {};
    const priv = privKeyRef.current;
    for (const item of state?.vaultItems || []) {
      if (!item.encrypted) {
        map[item.id] = item.content;
      } else if (priv) {
        try {
          map[item.id] = openSealed(priv, item.content);
        } catch {
          map[item.id] = '[Kan niet ontsleutelen]';
        }
      }
    }
    return map;
    // isUnlocked in deps: privKeyRef verandert samen met unlock-status
  }, [state?.vaultItems, isUnlocked]);

  if (!state) return null;

  async function finishUnlock(privateKey: Uint8Array, current: AppState) {
    privKeyRef.current = privateKey;
    // Migreer eventuele plaintext-items naar versleutelde vorm
    if (current.vaultKeys) {
      const { items, changed } = encryptPlaintextItems(
        current.vaultItems || [],
        current.vaultKeys.publicKey
      );
      if (changed) {
        await saveState({ vaultItems: items });
        setState((prev) => (prev ? { ...prev, vaultItems: items } : prev));
      }
    }
    await storeKeyForBiometrics(privateKey);
    setIsUnlocked(true);
    setPinInput('');
  }

  async function handleBiometricAuth() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Ontgrendel je kluis',
      cancelLabel: 'Gebruik wachtwoord',
      disableDeviceFallback: true,
    });
    if (!result.success) return;

    try {
      const hex = await SecureStore.getItemAsync(SECURE_STORE_KEY);
      if (hex) {
        const current = await loadState();
        await finishUnlock(hexToBytes(hex), current);
        return;
      }
    } catch {
      // valt door naar de melding hieronder
    }
    Alert.alert(
      'Eerst met wachtwoord',
      'Ontgrendel de kluis eerst een keer met je wachtwoord. Daarna werkt Face ID.'
    );
  }

  async function handleSetup() {
    if (pinStep === 'enter') {
      if (pinInput.length < 6) {
        Alert.alert('Te kort', 'Je wachtwoord moet minimaal 6 tekens zijn.');
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

    setBusy(true);
    try {
      const { keys, privateKey } = await createVaultKeys(pinInput);
      const current = await loadState();
      const { items } = encryptPlaintextItems(current.vaultItems || [], keys.publicKey);
      await saveState({ vaultKeys: keys, vaultPin: null, vaultItems: items });
      const updated = { ...current, vaultKeys: keys, vaultPin: null, vaultItems: items };
      setState(updated);
      privKeyRef.current = privateKey;
      await storeKeyForBiometrics(privateKey);
      setIsSettingPin(false);
      setIsUnlocked(true);
      setPinInput('');
      setConfirmPin('');
      setPinStep('enter');
    } finally {
      setBusy(false);
    }
  }

  // Brute-force-rem: na 5 foute pogingen gaat de kluis 30 seconden op slot,
  // daarna verdubbelt de wachttijd bij elke volgende foute poging
  async function registerFailedAttempt(current: AppState) {
    const attempts = (current.vaultFailedAttempts || 0) + 1;
    let lockUntil: number | null = null;
    if (attempts >= 5) {
      const lockSeconds = 30 * Math.pow(2, attempts - 5);
      lockUntil = Date.now() + lockSeconds * 1000;
    }
    await saveState({ vaultFailedAttempts: attempts, vaultLockUntil: lockUntil });
    if (lockUntil) {
      const secs = Math.round((lockUntil - Date.now()) / 1000);
      Alert.alert('Te veel pogingen', `De kluis is ${secs} seconden vergrendeld.`);
    } else {
      Alert.alert('Onjuist wachtwoord', `Probeer het opnieuw. Nog ${5 - attempts} pogingen voor een tijdslot.`);
    }
    setPinInput('');
  }

  async function handleUnlock() {
    if (!pinInput) return;
    setBusy(true);
    try {
      const current = await loadState();

      // Tijdslot actief?
      if (current.vaultLockUntil && Date.now() < current.vaultLockUntil) {
        const secs = Math.ceil((current.vaultLockUntil - Date.now()) / 1000);
        Alert.alert('Even wachten', `Te veel foute pogingen. Probeer het over ${secs} seconden opnieuw.`);
        setPinInput('');
        return;
      }

      if (current.vaultKeys) {
        // Normale route: prive-sleutel ontgrendelen met het wachtwoord.
        // Een fout wachtwoord laat de decryptie falen (Poly1305-check).
        try {
          const privateKey = await unlockWithPassword(pinInput, current.vaultKeys);
          await saveState({ vaultFailedAttempts: 0, vaultLockUntil: null });
          await finishUnlock(privateKey, current);
        } catch {
          await registerFailedAttempt(current);
        }
        return;
      }

      // Legacy route: er is alleen nog een (gehashte) pincode uit een oudere
      // versie. Verifieer die, en zet de kluis meteen om naar echte encryptie.
      const stored = current.vaultPin;
      if (!stored) return;
      const matches = isHashed(stored)
        ? (await hashPin(pinInput)) === stored
        : pinInput === stored;
      if (!matches) {
        await registerFailedAttempt(current);
        return;
      }
      await saveState({ vaultFailedAttempts: 0, vaultLockUntil: null });
      const { keys, privateKey } = await createVaultKeys(pinInput);
      const { items } = encryptPlaintextItems(current.vaultItems || [], keys.publicKey);
      await saveState({ vaultKeys: keys, vaultPin: null, vaultItems: items });
      setState({ ...current, vaultKeys: keys, vaultPin: null, vaultItems: items });
      privKeyRef.current = privateKey;
      await storeKeyForBiometrics(privateKey);
      setIsUnlocked(true);
      setPinInput('');
    } finally {
      setBusy(false);
    }
  }

  function handleLock() {
    privKeyRef.current = null;
    setIsUnlocked(false);
    setExpandedItem(null);
  }

  async function handleAddItem() {
    if (!newTitle.trim() || !state?.vaultKeys) return;
    const item: VaultItem = {
      id: generateId(),
      title: newTitle.trim(),
      category: newCategory,
      content: sealWithPublicKey(state.vaultKeys.publicKey, newContent.trim()),
      encrypted: true,
      createdAt: new Date().toISOString(),
    };
    const newItems = [...(state?.vaultItems || []), item];
    await saveState({ vaultItems: newItems });
    setState((prev) => (prev ? { ...prev, vaultItems: newItems } : prev));
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
          setState((prev) => (prev ? { ...prev, vaultItems: newItems } : prev));
        },
      },
    ]);
  }

  // Dubbele beveiliging: een wachtwoord tonen vraagt om een extra
  // biometrische bevestiging, ook al is de kluis al ontgrendeld
  async function handleExpandItem(item: VaultItem, isExpanded: boolean) {
    if (isExpanded) {
      setExpandedItem(null);
      return;
    }
    if (item.category === 'password' && hasBiometrics) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Bevestig om het wachtwoord te tonen',
      });
      if (!result.success) return;
    }
    setExpandedItem(item.id);
  }

  async function handleCopy(id: string) {
    const text = decrypted[id];
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
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

  // Setup screen
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
                ? 'Kies een sterk wachtwoord (min. 6 tekens). Alles in je kluis wordt hiermee versleuteld opgeslagen.'
                : 'Voer je wachtwoord nogmaals in ter bevestiging.'}
            </Text>
            <TextInput
              style={styles.pinInput}
              placeholder={pinStep === 'enter' ? 'Kies wachtwoord' : 'Bevestig wachtwoord'}
              placeholderTextColor="rgba(255, 255, 255, 0.65)"
              value={pinInput}
              onChangeText={setPinInput}
              secureTextEntry
              autoFocus
              onSubmitEditing={handleSetup}
            />
            <Button
              title={busy ? 'Bezig met versleutelen...' : pinStep === 'enter' ? 'Volgende' : 'Kluis beveiligen'}
              onPress={handleSetup}
              disabled={busy}
            />

            <View style={styles.offlineWarning}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.warning} />
              <Text style={styles.offlineWarningText}>
                Schrijf dit wachtwoord op en bewaar het op een veilige plek. Zonder wachtwoord is je kluis niet te openen, ook niet door ons.
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
              Je gegevens zijn versleuteld. Ontgrendel met {hasBiometrics ? 'Face ID / vingerafdruk of ' : ''}je wachtwoord.
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
              placeholderTextColor="rgba(255, 255, 255, 0.65)"
              value={pinInput}
              onChangeText={setPinInput}
              secureTextEntry
              autoFocus={!hasBiometrics}
              onSubmitEditing={handleUnlock}
            />
            <Button
              title={busy ? 'Ontgrendelen...' : 'Ontgrendelen'}
              onPress={handleUnlock}
              disabled={busy}
            />
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
              <Text style={styles.headerLabel}>End-to-end versleuteld</Text>
              <Text style={styles.title}>Kluis</Text>
            </View>
            <TouchableOpacity onPress={handleLock} style={styles.lockButton}>
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
            {newCategory === 'password' && (
              <Text style={styles.passwordHint}>
                Tip: bewaar alleen wat nabestaanden echt nodig hebben, zoals de toegang tot je telefoon, e-mail en DigiD. Hoe minder er in de kluis staat, hoe kleiner het risico.
              </Text>
            )}
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
                Doorloop de stappen in 'Te Doen'. Je gegevens worden automatisch versleuteld hier opgeslagen.
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
              const plain = decrypted[item.id] ?? '';
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleExpandItem(item, isExpanded)}
                >
                  <Card style={styles.itemCard}>
                    <View style={styles.itemRow}>
                      <View style={[styles.itemIcon, { backgroundColor: `${getCategoryColor(item.category)}15` }]}>
                        <Ionicons name={getCategoryIcon(item.category)} size={18} color={getCategoryColor(item.category)} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        {!isExpanded && plain ? (
                          <Text style={styles.itemPreview}>
                            {isPassword ? '••••••••' : plain.split('\n')[0]}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textTertiary}
                      />
                    </View>
                    {isExpanded && plain ? (
                      <View style={styles.itemExpanded}>
                        <Text style={styles.itemFullContent}>{plain}</Text>
                        <View style={styles.itemActions}>
                          <TouchableOpacity
                            onPress={() => handleCopy(item.id)}
                            style={styles.actionRow}
                          >
                            <Ionicons
                              name={copiedId === item.id ? 'checkmark' : 'copy-outline'}
                              size={16}
                              color={copiedId === item.id ? Colors.primary : Colors.textSecondary}
                            />
                            <Text style={[styles.actionText, copiedId === item.id && styles.actionTextActive]}>
                              {copiedId === item.id ? 'Gekopieerd' : 'Kopieer'}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleDeleteItem(item.id)}
                            style={styles.actionRow}
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                            <Text style={styles.deleteText}>Verwijderen</Text>
                          </TouchableOpacity>
                        </View>
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
    backgroundColor: 'transparent',
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
    color: 'rgba(255, 255, 255, 0.85)',
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
    backgroundColor: 'rgba(10, 14, 40, 0.35)',
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
    color: 'rgba(255, 255, 255, 0.92)',
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
  passwordHint: {
    fontSize: FontSizes.small,
    color: Colors.warning,
    lineHeight: 19,
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
  itemActions: {
    flexDirection: 'row',
    gap: Spacing.xl,
    paddingTop: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  actionTextActive: {
    color: Colors.primary,
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
