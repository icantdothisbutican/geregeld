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
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, FontSizes, BorderRadius } from '../../src/constants/theme';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { loadState, saveState, Contact, generateId } from '../../src/store/appStore';

const MAX_FREE_CONTACTS = 5;

const RELATION_OPTIONS = ['Partner', 'Kind', 'Ouder', 'Vriend', 'Collega', 'Buur', 'Anders'];
const ROLE_OPTIONS = ['Vertrouwenspersoon', 'Rouwkaart', 'Uitvaart uitgenodigd', 'Executeur', 'Anders'];

export default function ContactsScreen() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<Omit<Contact, 'id'>>({
    name: '',
    phone: '',
    email: '',
    relation: '',
    role: '',
    notes: '',
  });

  useFocusEffect(
    useCallback(() => {
      loadState().then((s) => setContacts(s.contacts || []));
    }, [])
  );

  function resetForm() {
    setForm({ name: '', phone: '', email: '', relation: '', role: '', notes: '' });
    setEditingContact(null);
    setShowForm(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      Alert.alert('Naam is verplicht', 'Vul een naam in voor dit contact.');
      return;
    }

    let newContacts: Contact[];
    if (editingContact) {
      newContacts = contacts.map((c) =>
        c.id === editingContact.id ? { ...form, id: c.id } : c
      );
    } else {
      newContacts = [...contacts, { ...form, id: generateId() }];
    }

    await saveState({ contacts: newContacts });
    setContacts(newContacts);
    resetForm();
  }

  async function handleDelete(id: string) {
    Alert.alert('Contact verwijderen', 'Weet je zeker dat je dit contact wilt verwijderen?', [
      { text: 'Annuleren', style: 'cancel' },
      {
        text: 'Verwijderen',
        style: 'destructive',
        onPress: async () => {
          const newContacts = contacts.filter((c) => c.id !== id);
          await saveState({ contacts: newContacts });
          setContacts(newContacts);
        },
      },
    ]);
  }

  function startEdit(contact: Contact) {
    setForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      relation: contact.relation,
      role: contact.role,
      notes: contact.notes,
    });
    setEditingContact(contact);
    setShowForm(true);
  }

  const canAddMore = contacts.length < MAX_FREE_CONTACTS;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Contacten</Text>
            <Text style={styles.subtitle}>
              Wie moet geïnformeerd worden? ({contacts.length}/{MAX_FREE_CONTACTS} gratis)
            </Text>
          </View>

          {contacts.length === 0 && !showForm && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>Nog geen contacten</Text>
              <Text style={styles.emptyText}>
                Voeg de mensen toe die geïnformeerd moeten worden bij een overlijden.
              </Text>
            </Card>
          )}

          {contacts.map((contact) => (
            <Card key={contact.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.relation ? (
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                  ) : null}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity onPress={() => startEdit(contact)}>
                    <Text style={styles.actionText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(contact.id)}>
                    <Text style={styles.actionText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {contact.phone ? (
                <Text style={styles.contactDetail}>📞 {contact.phone}</Text>
              ) : null}
              {contact.email ? (
                <Text style={styles.contactDetail}>✉️ {contact.email}</Text>
              ) : null}
              {contact.role ? (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{contact.role}</Text>
                </View>
              ) : null}
              {contact.notes ? (
                <Text style={styles.contactNotes}>{contact.notes}</Text>
              ) : null}
            </Card>
          ))}

          {showForm && (
            <Card style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingContact ? 'Contact bewerken' : 'Nieuw contact'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Naam *"
                placeholderTextColor={Colors.slateMuted}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefoonnummer"
                placeholderTextColor={Colors.slateMuted}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="E-mailadres"
                placeholderTextColor={Colors.slateMuted}
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.fieldLabel}>Relatie</Text>
              <View style={styles.chipRow}>
                {RELATION_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, form.relation === option && styles.chipSelected]}
                    onPress={() => setForm({ ...form, relation: option })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.relation === option && styles.chipTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Rol bij overlijden</Text>
              <View style={styles.chipRow}>
                {ROLE_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.chip, form.role === option && styles.chipSelected]}
                    onPress={() => setForm({ ...form, role: option })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        form.role === option && styles.chipTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notities (bijv. 'woont in Australië')"
                placeholderTextColor={Colors.slateMuted}
                value={form.notes}
                onChangeText={(t) => setForm({ ...form, notes: t })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.formButtons}>
                <Button title="Opslaan" onPress={handleSave} variant="secondary" size="medium" />
                <Button title="Annuleren" onPress={resetForm} variant="outline" size="medium" />
              </View>
            </Card>
          )}

          {!showForm && (
            <Button
              title={canAddMore ? '+ Contact toevoegen' : 'Upgrade voor meer contacten'}
              onPress={() => {
                if (canAddMore) {
                  setShowForm(true);
                } else {
                  Alert.alert(
                    'Gratis limiet bereikt',
                    'Upgrade naar Geregeld+ voor onbeperkt contacten.'
                  );
                }
              }}
              variant={canAddMore ? 'secondary' : 'outline'}
              size="medium"
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
  },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  emptyText: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  contactCard: {
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactName: {
    fontSize: FontSizes.large,
    fontWeight: '700',
    color: Colors.slate,
  },
  contactRelation: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionText: {
    fontSize: 18,
  },
  contactDetail: {
    fontSize: FontSizes.body,
    color: Colors.slateMuted,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.greenBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.greenDark,
  },
  contactNotes: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
  },
  formCard: {
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: FontSizes.h3,
    fontWeight: '700',
    color: Colors.slate,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  fieldLabel: {
    fontSize: FontSizes.small,
    fontWeight: '600',
    color: Colors.slate,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.warmGray,
  },
  chipSelected: {
    backgroundColor: Colors.greenBg,
    borderColor: Colors.green,
  },
  chipText: {
    fontSize: FontSizes.small,
    color: Colors.slateMuted,
  },
  chipTextSelected: {
    color: Colors.greenDark,
    fontWeight: '600',
  },
  formButtons: {
    gap: Spacing.sm,
  },
  bottomPadding: {
    height: Spacing.xxl,
  },
});
