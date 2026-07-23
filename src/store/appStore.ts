import AsyncStorage from '@react-native-async-storage/async-storage';
import type { VaultKeys } from '../lib/vaultCrypto';

export interface UserSituation {
  hasPartner: boolean | null;
  hasChildren: boolean | null;
  housingType: 'huur' | 'koop' | 'anders' | null;
}

export interface OnboardingData {
  name: string;
  ageRange: '18-30' | '30-50' | '50-65' | '65+' | null;
  hasTestament: 'ja' | 'nee' | 'weet-niet' | null;
  preferenceMode: 'digitaal' | 'analoog' | null;
  trustedPerson: { name: string; relation: string } | null;
  uitvaartWens: 'crematie' | 'begraven' | null;
  address: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
  role: string;
  notes: string;
}

export interface FuneralWishes {
  type: 'crematie' | 'begraven' | null;
  location: string;
  music: string[];
  speakers: string[];
  dressCode: string;
  flowers: string;
  condolence: string;
  specialWishes: string;
}

export interface VaultItem {
  id: string;
  title: string;
  category: 'document' | 'password' | 'note';
  content: string;
  createdAt: string;
  // true = content is sealed met de kluis-sleutel; false/afwezig = plaintext
  // (wordt bij de eerstvolgende unlock alsnog versleuteld)
  encrypted?: boolean;
  // koppelt kluis-items aan hun bron (bijv. een bericht-id) voor sync/delete
  sourceId?: string;
}

export interface Message {
  id: string;
  type: 'text' | 'voice' | 'question';
  title: string;
  content: string;
  recipient?: string;
  createdAt: string;
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  situation: UserSituation;
  onboarding: OnboardingData;
  checkedItems: string[];
  completedFlows: string[];
  contacts: Contact[];
  funeralWishes: FuneralWishes;
  vaultPin: string | null;
  vaultKeys: VaultKeys | null;
  vaultItems: VaultItem[];
  vaultUnlocked: boolean;
  // Brute-force-rem: aantal mislukte pogingen en tot wanneer de kluis
  // op slot blijft na te veel pogingen
  vaultFailedAttempts: number;
  vaultLockUntil: number | null;
  messages: Message[];
  hasSeenIntro: boolean;
}

const DEFAULT_STATE: AppState = {
  hasCompletedOnboarding: false,
  situation: {
    hasPartner: null,
    hasChildren: null,
    housingType: null,
  },
  onboarding: {
    name: '',
    ageRange: null,
    hasTestament: null,
    preferenceMode: null,
    trustedPerson: null,
    uitvaartWens: null,
    address: '',
  },
  checkedItems: [],
  completedFlows: [],
  contacts: [],
  funeralWishes: {
    type: null,
    location: '',
    music: [],
    speakers: [],
    dressCode: '',
    flowers: '',
    condolence: '',
    specialWishes: '',
  },
  vaultPin: null,
  vaultKeys: null,
  vaultItems: [],
  vaultUnlocked: false,
  vaultFailedAttempts: 0,
  vaultLockUntil: null,
  messages: [],
  hasSeenIntro: false,
};

const STORAGE_KEY = '@geregeld_state_v2';

export async function loadState(): Promise<AppState> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return {
        ...DEFAULT_STATE,
        ...parsed,
        situation: { ...DEFAULT_STATE.situation, ...parsed.situation },
        onboarding: { ...DEFAULT_STATE.onboarding, ...parsed.onboarding },
        funeralWishes: { ...DEFAULT_STATE.funeralWishes, ...parsed.funeralWishes },
      };
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return DEFAULT_STATE;
}

export async function saveState(state: Partial<AppState>): Promise<void> {
  try {
    const current = await loadState();
    const merged = { ...current, ...state };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
