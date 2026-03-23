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
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, AppState, VaultItem, generateId } from '../../src/store/appStore';

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

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => {
        setState(s);
        if (!s.vaultPin) {
          setIsSettingPin(true);
        }
        setIsUnlocked(false);
        setPinInput('');
      });
    }, [])
  );

  if (!state) return null;

  async function handleSetPin() {
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

    await saveState({ vaultPin: pinInput });
    setState((prev) => prev ? { ...prev, vaultPin: pinInput } : prev);
    setIsSettingPin(false);
    setIsUnlocked(true);
    setPinInput('');
    setPinStep('enter');
  }

  function handleUnlock() {
    if (pinInput === state?.vaultPin) {
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

  const getCategoryIcon = (cat: string) => {
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

  // PIN setup screen
  if (isSettingPin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockScreen}>
          <View style={styles.lockIconContainer}>
            <Ionicons name="shield-checkmark" size={64} color={Colors.accent} />
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
        </View>
      </SafeAreaView>
    );
  }

  // Lock screen
  if (!isUnlocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.lockScreen}>
          <View style={styles.lockIconContainer}>
            <Ionicons name="lock-closed" size={64} color={Colors.accent} />
          </View>
          <Text style={styles.lockTitle}>Kluis vergrendeld</Text>
          <Text style={styles.lockSubtitle}>
            Voer je wachtwoord in om toegang te krijgen tot je gevoelige documenten.
          </Text>
          <TextInput
            style={styles.pinInput}
            placeholder="Wachtwoord"
            placeholderTextColor={Colors.textTertiary}
            value={pinInput}
            onChangeText={setPinInput}
            secureTextEntry
            autoFocus
            onSubmitEditing={handleUnlock}
          />
          <Button title="Ontgrendelen" onPress={handleUnlock} />
        </View>
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
              <Text style={styles.title}>Kluis</Text>
              <Text style={styles.subtitle}>Je gevoelige documenten, veilig bewaard</Text>
            </View>
            <TouchableOpacity onPress={() => setIsUnlocked(false)} style={styles.lockButton}>
              <Ionicons name="lock-open-outline" size={24} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Add item */}
        {addingItem ? (
          <Card style={styles.addCard}>
            <Text style={styles.addTitle}>Nieuw item toevoegen</Text>
            <View style={styles.categoryRow}>
              {(['document', 'password', 'note'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Ionicons name={getCategoryIcon(cat) as any} size={16} color={newCategory === cat ? Colors.primary : Colors.textSecondary} />
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
              placeholder="Inhoud (bijv. wachtwoord, notitie)"
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
          <TouchableOpacity style={styles.addButton} onPress={() => setAddingItem(true)} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
            <Text style={styles.addButtonText}>Item toevoegen</Text>
          </TouchableOpacity>
        )}

        {items.length === 0 && !addingItem && (
          <Card style={styles.emptyCard}>
            <Ionicons name="shield-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Je kluis is leeg</Text>
            <Text style={styles.emptyText}>
              Bewaar hier je gevoelige documenten, wachtwoorden en notities. Alles is beveiligd met je persoonlijke wachtwoord.
            </Text>
          </Card>
        )}

        {documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documenten</Text>
            {documents.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.content ? <Text style={styles.itemText}>{item.content}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {passwords.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Wachtwoorden</Text>
            {passwords.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="key-outline" size={20} color={Colors.pink} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.content ? <Text style={styles.itemText}>••••••••</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        {notes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notities</Text>
            {notes.map((item) => (
              <Card key={item.id} style={styles.itemCard}>
                <View style={styles.itemRow}>
                  <View style={styles.itemIcon}>
                    <Ionicons name="create-outline" size={20} color={Colors.warning} />
                  </View>
                  <View style={styles.itemContent}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.content ? <Text style={styles.itemText}>{item.content}</Text> : null}
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

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
  title: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  lockButton: {
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },
  lockScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  lockIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  lockTitle: {
    fontSize: FontSizes.h1,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  lockSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pinInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    fontSize: FontSizes.large,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    width: '100%',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.primary,
  },
  addCard: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  addTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
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
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
    fontWeight: '500',
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
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.text,
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
    backgroundColor: Colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    gap: 2,
  },
  itemTitle: {
    fontSize: FontSizes.body,
    fontWeight: '600',
    color: Colors.text,
  },
  itemText: {
    fontSize: FontSizes.small,
    color: Colors.textSecondary,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
