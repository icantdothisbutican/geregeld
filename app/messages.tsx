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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius } from '../src/constants/theme';
import { Card } from '../src/components/Card';
import { GradientCard, GRADIENT_PRESETS } from '../src/components/GradientCard';
import { Button } from '../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { loadState, saveState, AppState, Message, generateId } from '../src/store/appStore';
import { encryptContentIfPossible } from '../src/lib/vaultCrypto';

type MessageType = 'text' | 'voice' | 'question';

const MESSAGE_TYPES: { type: MessageType; icon: string; label: string; description: string; colors: string[] }[] = [
  {
    type: 'text',
    icon: 'heart-outline',
    label: 'Boodschap',
    description: 'Wijsheid, herinneringen of een liefdesbrief',
    colors: GRADIENT_PRESETS.warm,
  },
  {
    type: 'voice',
    icon: 'mic-outline',
    label: 'Spraaknotitie',
    description: 'Spreek een boodschap in met je eigen stem',
    colors: GRADIENT_PRESETS.cool,
  },
  {
    type: 'question',
    icon: 'help-circle-outline',
    label: 'Vraag',
    description: 'Stel een vraag die pas later beantwoord wordt',
    colors: GRADIENT_PRESETS.glow,
  },
];

const PROMPTS = [
  'Wat is het beste advies dat je ooit hebt gekregen?',
  'Welke herinnering koester je het meest?',
  'Wat wil je dat je kinderen onthouden?',
  'Waar ben je het meest trots op?',
  'Wat zou je jezelf op je 20e vertellen?',
  'Welk moment heeft je leven veranderd?',
  'Wat is je favoriete familietraditie?',
  'Welke les heb je op de moeilijke manier geleerd?',
];

export default function MessagesScreen() {
  const router = useRouter();
  const [state, setState] = useState<AppState | null>(null);
  const [composing, setComposing] = useState<MessageType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState('');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(Math.floor(Math.random() * PROMPTS.length));

  useFocusEffect(
    useCallback(() => {
      loadState().then(setState);
    }, [])
  );

  if (!state) return null;

  const messages = state.messages || [];

  async function handleSave() {
    if (!content.trim()) {
      Alert.alert('Schrijf iets', 'Je bericht kan niet leeg zijn.');
      return;
    }
    const msg: Message = {
      id: generateId(),
      type: composing!,
      title: title.trim() || getDefaultTitle(composing!),
      content: content.trim(),
      recipient: recipient.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    const newMessages = [...messages, msg];

    // Also save to vault (versleuteld als de kluis is ingesteld)
    const vaultItems = state?.vaultItems || [];
    const sealed = encryptContentIfPossible(state?.vaultKeys, msg.content);
    const vaultEntry = {
      id: generateId(),
      title: `${msg.recipient ? `Aan ${msg.recipient}: ` : ''}${msg.title}`,
      category: 'note' as const,
      content: sealed.content,
      encrypted: sealed.encrypted,
      sourceId: msg.id,
      createdAt: msg.createdAt,
    };
    const newVaultItems = [...vaultItems, vaultEntry];

    // Saving a first message completes the checklist item
    const checkedItems = state?.checkedItems || [];
    const newChecked = checkedItems.includes('boo-1')
      ? checkedItems
      : [...checkedItems, 'boo-1'];

    await saveState({ messages: newMessages, vaultItems: newVaultItems, checkedItems: newChecked });
    setState((prev) => prev ? { ...prev, messages: newMessages, vaultItems: newVaultItems, checkedItems: newChecked } : prev);
    setComposing(null);
    setTitle('');
    setContent('');
    setRecipient('');
  }

  async function handleDelete(id: string) {
    Alert.alert('Verwijderen', 'Weet je zeker dat je dit bericht wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: async () => {
          const deletedMsg = messages.find((m) => m.id === id);
          const newMessages = messages.filter((m) => m.id !== id);
          // Also remove matching vault item: nieuwe items via sourceId,
          // oudere items (zonder sourceId) via inhoud-vergelijking
          const vaultItems = (state?.vaultItems || []).filter((v) => {
            if (v.sourceId === id) return false;
            if (!v.sourceId && v.category === 'note' && deletedMsg && !v.encrypted && v.content === deletedMsg.content) return false;
            return true;
          });
          await saveState({ messages: newMessages, vaultItems });
          setState((prev) => prev ? { ...prev, messages: newMessages, vaultItems } : prev);
          setExpandedMessage(null);
        },
      },
    ]);
  }

  function getDefaultTitle(type: MessageType): string {
    switch (type) {
      case 'text': return 'Mijn boodschap';
      case 'voice': return 'Spraaknotitie';
      case 'question': return 'Mijn vraag';
    }
  }

  function getTypeIcon(type: MessageType): any {
    switch (type) {
      case 'text': return 'heart';
      case 'voice': return 'mic';
      case 'question': return 'help-circle';
    }
  }

  function getTypeGradient(type: MessageType): string[] {
    switch (type) {
      case 'text': return GRADIENT_PRESETS.warm;
      case 'voice': return GRADIENT_PRESETS.cool;
      case 'question': return GRADIENT_PRESETS.glow;
    }
  }

  function usePrompt() {
    setContent(PROMPTS[promptIndex]);
    setPromptIndex((prev) => (prev + 1) % PROMPTS.length);
  }

  // Composing view
  if (composing) {
    const typeConfig = MESSAGE_TYPES.find((t) => t.type === composing)!;
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => setComposing(null)} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color={Colors.text} />
            </TouchableOpacity>

            <GradientCard colors={typeConfig.colors} style={styles.composeHeader}>
              <Ionicons name={typeConfig.icon as any} size={32} color="#fff" />
              <Text style={styles.composeTitle}>{typeConfig.label}</Text>
              <Text style={styles.composeSubtitle}>{typeConfig.description}</Text>
            </GradientCard>

            {composing === 'text' && (
              <TouchableOpacity style={styles.promptButton} onPress={usePrompt} activeOpacity={0.7}>
                <Ionicons name="sparkles-outline" size={16} color={Colors.accent} />
                <Text style={styles.promptText}>Inspiratie nodig? Tik hier</Text>
              </TouchableOpacity>
            )}

            <Card style={styles.composeCard}>
              <TextInput
                style={styles.input}
                placeholder="Aan wie is dit gericht? (optioneel)"
                placeholderTextColor={Colors.textTertiary}
                value={recipient}
                onChangeText={setRecipient}
              />
              <TextInput
                style={styles.input}
                placeholder="Titel"
                placeholderTextColor={Colors.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.contentInput]}
                placeholder={
                  composing === 'question'
                    ? 'Schrijf je vraag hier...'
                    : composing === 'voice'
                    ? 'Beschrijf wat je wilt inspreken, of typ je boodschap...'
                    : 'Schrijf je boodschap...'
                }
                placeholderTextColor={Colors.textTertiary}
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus
              />
            </Card>

            <View style={styles.composeActions}>
              <Button title="Opslaan" onPress={handleSave} />
              <Button title="Annuleren" onPress={() => setComposing(null)} variant="outline" size="medium" />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // List view
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerLabel}>Voor je naasten</Text>
          <Text style={styles.pageTitle}>Berichten</Text>
          <Text style={styles.headerSubtitle}>
            Laat wijsheid, herinneringen en boodschappen achter voor de mensen die je liefhebt.
          </Text>
        </View>

        {/* New message buttons */}
        <View style={styles.typeGrid}>
          {MESSAGE_TYPES.map((mt) => (
            <TouchableOpacity key={mt.type} activeOpacity={0.7} onPress={() => setComposing(mt.type)}>
              <GradientCard colors={mt.colors} style={styles.typeCard}>
                <View style={styles.typeIconWrap}>
                  <Ionicons name={mt.icon as any} size={24} color="#fff" />
                </View>
                <Text style={styles.typeLabel}>{mt.label}</Text>
                <Text style={styles.typeDesc}>{mt.description}</Text>
              </GradientCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* Existing messages */}
        {messages.length > 0 && (
          <View style={styles.messagesSection}>
            <Text style={styles.sectionTitle}>
              {messages.length} {messages.length === 1 ? 'bericht' : 'berichten'}
            </Text>

            {messages.map((msg) => {
              const isExpanded = expandedMessage === msg.id;
              return (
                <TouchableOpacity
                  key={msg.id}
                  activeOpacity={0.7}
                  onPress={() => setExpandedMessage(isExpanded ? null : msg.id)}
                >
                  <Card style={styles.messageCard}>
                    <View style={styles.messageRow}>
                      <View style={[styles.messageIcon, { backgroundColor: `${getTypeGradient(msg.type)[0]}20` }]}>
                        <Ionicons name={getTypeIcon(msg.type)} size={18} color={getTypeGradient(msg.type)[0]} />
                      </View>
                      <View style={styles.messageContent}>
                        <Text style={styles.messageTitle}>{msg.title}</Text>
                        {msg.recipient && (
                          <Text style={styles.messageRecipient}>Aan: {msg.recipient}</Text>
                        )}
                        {!isExpanded && (
                          <Text style={styles.messagePreview} numberOfLines={1}>
                            {msg.content}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={Colors.textTertiary}
                      />
                    </View>

                    {isExpanded && (
                      <View style={styles.messageExpanded}>
                        <Text style={styles.messageFullContent}>{msg.content}</Text>
                        <Text style={styles.messageDate}>
                          {new Date(msg.createdAt).toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleDelete(msg.id)}
                          style={styles.deleteRow}
                        >
                          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                          <Text style={styles.deleteText}>Verwijderen</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {messages.length === 0 && (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Text style={styles.emptyTitle}>Nog geen berichten</Text>
              <Text style={styles.emptyText}>
                Kies hierboven een type om je eerste boodschap achter te laten.
              </Text>
            </View>
          </Card>
        )}

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
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  headerLabel: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  pageTitle: {
    fontSize: FontSizes.h1,
    fontWeight: FontWeights.heavy,
    color: Colors.text,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  typeGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeCard: {
    // GradientCard handles padding
  },
  typeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  typeLabel: {
    fontSize: FontSizes.large,
    fontWeight: FontWeights.bold,
    color: '#fff',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: FontSizes.small,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  messagesSection: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.small,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageCard: {
    padding: Spacing.lg,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  messageIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
    gap: 2,
  },
  messageTitle: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    color: Colors.text,
  },
  messageRecipient: {
    fontSize: FontSizes.small,
    color: Colors.accent,
    fontWeight: FontWeights.medium,
  },
  messagePreview: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
  },
  messageExpanded: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
    gap: Spacing.md,
  },
  messageFullContent: {
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  messageDate: {
    fontSize: FontSizes.small,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  deleteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSizes.small,
    color: Colors.danger,
    fontWeight: FontWeights.medium,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
    gap: Spacing.sm,
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
  // Compose screen
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
  },
  composeHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  composeTitle: {
    fontSize: FontSizes.h2,
    fontWeight: FontWeights.bold,
    color: '#fff',
    marginTop: Spacing.md,
  },
  composeSubtitle: {
    fontSize: FontSizes.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  promptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.accentLight,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 87, 108, 0.2)',
  },
  promptText: {
    fontSize: FontSizes.body,
    color: Colors.accent,
    fontWeight: FontWeights.medium,
  },
  composeCard: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  input: {
    backgroundColor: Colors.fill,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: FontSizes.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contentInput: {
    minHeight: 160,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  composeActions: {
    gap: Spacing.sm,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
