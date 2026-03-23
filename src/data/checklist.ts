export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  actionLabel?: string;
  actionHint?: string;
  requiresPartner?: boolean;
  requiresChildren?: boolean;
  requiresHuur?: boolean;
  requiresKoop?: boolean;
  requiresDigitaal?: boolean;
  requiresAnaloog?: boolean;
  requiresNoTestament?: boolean;
}

export interface Chapter {
  key: string;
  icon: string;
  label: string;
  description: string;
  items: ChecklistItem[];
}

export const CHAPTERS: Chapter[] = [
  {
    key: 'juridisch',
    icon: '⚖️',
    label: 'Juridisch',
    description: 'Zorg dat je rechten en wensen vastliggen',
    items: [
      {
        id: 'jur-1',
        title: 'Testament laten opstellen',
        description: 'Een testament regelt wie wat erft en voorkomt conflicten. Zonder testament geldt het wettelijk erfrecht.',
        urgency: 'high',
        actionLabel: 'Notaris zoeken',
        actionHint: 'We helpen je een notaris in de buurt te vinden',
        requiresNoTestament: true,
      },
      {
        id: 'jur-1b',
        title: 'Testament controleren',
        description: 'Je hebt al een testament. Controleer of het nog actueel is — zeker na een verhuizing, scheiding of geboorte.',
        urgency: 'medium',
        actionLabel: 'Markeer als gecontroleerd',
      },
      {
        id: 'jur-2',
        title: 'Levenstestament opstellen',
        description: 'Hierin regel je wie beslissingen voor je mag nemen als je dat zelf niet meer kunt (medisch en financieel).',
        urgency: 'high',
        actionLabel: 'Meer informatie',
      },
      {
        id: 'jur-3',
        title: 'Samenlevingscontract regelen',
        description: 'Zonder samenlevingscontract heeft je partner juridisch bijna geen rechten op jullie bezittingen.',
        urgency: 'high',
        requiresPartner: true,
      },
      {
        id: 'jur-4',
        title: 'Geregistreerd partnerschap of huwelijk overwegen',
        description: 'Dit geeft je partner de sterkste juridische positie bij overlijden.',
        urgency: 'medium',
        requiresPartner: true,
      },
    ],
  },
  {
    key: 'financieel',
    icon: '💰',
    label: 'Financieel',
    description: 'Geef nabestaanden inzicht in je financien',
    items: [
      {
        id: 'fin-1',
        title: 'Bankrekeningen documenteren',
        description: 'Leg vast bij welke banken je rekeningen hebt en hoe nabestaanden toegang krijgen.',
        urgency: 'high',
        actionLabel: 'Banken invullen',
      },
      {
        id: 'fin-2',
        title: 'Verzekeringen op een rij zetten',
        description: 'Uitvaartverzekering, levensverzekering, zorgverzekering — leg de polisgegevens vast.',
        urgency: 'high',
      },
      {
        id: 'fin-3',
        title: 'Pensioengegevens vastleggen',
        description: 'Noteer je pensioenfonds en eventueel nabestaandenpensioen.',
        urgency: 'medium',
      },
      {
        id: 'fin-4',
        title: 'Lopende abonnementen inventariseren',
        description: 'Maak een lijst van alle abonnementen zodat nabestaanden deze kunnen opzeggen.',
        urgency: 'low',
        actionLabel: 'Lijst maken',
      },
      {
        id: 'fin-5',
        title: 'Schulden en leningen documenteren',
        description: 'Leg vast of je schulden of leningen hebt, zodat nabestaanden weten wat er speelt.',
        urgency: 'medium',
      },
    ],
  },
  {
    key: 'woning',
    icon: '🏠',
    label: 'Woning',
    description: 'Regel alles rondom je woonsituatie',
    items: [
      {
        id: 'won-1',
        title: 'Huurcontract veiligstellen',
        description: 'Zorg dat je partner of nabestaanden weten waar het huurcontract ligt en op wiens naam het staat.',
        urgency: 'high',
        requiresHuur: true,
      },
      {
        id: 'won-2',
        title: 'Hypotheekgegevens vastleggen',
        description: 'Documenteer je hypotheekverstrekker, voorwaarden, en of er een overlijdensrisicoverzekering is.',
        urgency: 'high',
        requiresKoop: true,
      },
      {
        id: 'won-3',
        title: 'Woningverzekering controleren',
        description: 'Controleer of de woning goed verzekerd is en leg de polisgegevens vast.',
        urgency: 'medium',
      },
      {
        id: 'won-4',
        title: 'Sleutels en toegang regelen',
        description: 'Zorg dat iemand een reservesleutel heeft en weet hoe het alarm werkt.',
        urgency: 'low',
      },
    ],
  },
  {
    key: 'digitaal',
    icon: '📱',
    label: 'Digitale Toegang',
    description: 'Zorg dat je digitale leven toegankelijk is',
    items: [
      {
        id: 'dig-1',
        title: 'Wachtwoorden delen via vertrouwenspersoon',
        description: 'Deel je wachtwoorden veilig met je vertrouwenspersoon. Gebruik Apple/Google ingebouwde deelfunctie of een wachtwoordmanager.',
        urgency: 'high',
        requiresDigitaal: true,
        actionLabel: 'Uitleg bekijken',
        actionHint: 'We laten zien hoe je wachtwoorden deelt via iPhone of Android instellingen',
      },
      {
        id: 'dig-1b',
        title: 'Wachtwoorden opschrijven',
        description: 'Schrijf je belangrijkste wachtwoorden op en bewaar ze op een veilige plek die je vertrouwenspersoon kent.',
        urgency: 'high',
        requiresAnaloog: true,
        actionLabel: 'Print template',
      },
      {
        id: 'dig-2',
        title: 'E-mail toegang documenteren',
        description: 'Toegang tot je e-mail is cruciaal voor nabestaanden om accounts en abonnementen te vinden.',
        urgency: 'high',
      },
      {
        id: 'dig-3',
        title: 'Social media wensen vastleggen',
        description: 'Wil je dat je accounts worden verwijderd of omgezet naar een herdenkingspagina?',
        urgency: 'low',
      },
      {
        id: 'dig-4',
        title: 'Cloud-opslag en bestanden',
        description: 'Leg vast waar je belangrijke bestanden opslaat (iCloud, Google Drive, etc.).',
        urgency: 'medium',
      },
    ],
  },
  {
    key: 'contacten',
    icon: '👥',
    label: 'Contacten & Communicatie',
    description: 'Wie moet weten dat je er niet meer bent?',
    items: [
      {
        id: 'con-1',
        title: 'Contactpersonenlijst maken',
        description: 'Maak een lijst van mensen die geinformeerd moeten worden bij overlijden.',
        urgency: 'high',
        actionLabel: 'Contacten toevoegen',
        actionHint: 'Voeg contacten toe die we later via PostNL een brief kunnen sturen',
      },
      {
        id: 'con-2',
        title: 'Rouwkaarten voorbereiden',
        description: 'Bereid rouwkaarten voor die met een druk op de knop verstuurd kunnen worden via PostNL.',
        urgency: 'medium',
        actionLabel: 'Kaart ontwerpen',
        actionHint: 'Kies een template en personaliseer je rouwkaart',
      },
      {
        id: 'con-3',
        title: 'Werkgever informatie vastleggen',
        description: 'Noteer je werkgever, HR-contactpersoon, en eventuele nabestaandenregelingen.',
        urgency: 'medium',
      },
      {
        id: 'con-4',
        title: 'Huisarts en medische contacten',
        description: 'Leg de gegevens van je huisarts en eventuele specialisten vast.',
        urgency: 'medium',
      },
    ],
  },
  {
    key: 'uitvaart',
    icon: '🕯️',
    label: 'Uitvaartwensen',
    description: 'Leg vast hoe jij afscheid wilt nemen',
    items: [
      {
        id: 'uit-1',
        title: 'Crematie of begraven vastleggen',
        description: 'Je keuze wordt opgeslagen zodat je naasten niet hoeven te twijfelen.',
        urgency: 'medium',
        actionLabel: 'Keuze maken',
      },
      {
        id: 'uit-2',
        title: 'Uitvaartlocatie aangeven',
        description: 'Heb je een voorkeur voor een specifieke locatie? (kerk, aula, buiten, thuis)',
        urgency: 'low',
      },
      {
        id: 'uit-3',
        title: 'Muziek en sprekers vastleggen',
        description: 'Welke muziek wil je? Wie mag er spreken?',
        urgency: 'low',
        actionLabel: 'Wensen invullen',
      },
    ],
  },
  {
    key: 'kinderen',
    icon: '👶',
    label: 'Kinderen & Huisdieren',
    description: 'Zorg voor wie van je afhankelijk is',
    items: [
      {
        id: 'kin-1',
        title: 'Voogdij regelen voor kinderen',
        description: 'Leg vast wie er voor je kinderen zorgt als jij er niet meer bent. Dit moet in een testament.',
        urgency: 'high',
        requiresChildren: true,
        actionLabel: 'Voogd aanwijzen',
      },
      {
        id: 'kin-2',
        title: 'Financiele voorziening voor kinderen',
        description: 'Denk aan een levensverzekering of spaarregeling voor je kinderen.',
        urgency: 'high',
        requiresChildren: true,
      },
      {
        id: 'kin-3',
        title: 'Huisdieren onderbrengen',
        description: 'Leg vast wie er voor je huisdieren zorgt als jij er niet meer bent.',
        urgency: 'medium',
      },
    ],
  },
  {
    key: 'boodschappen',
    icon: '💌',
    label: 'Persoonlijke Boodschappen',
    description: 'Laat een persoonlijk bericht achter',
    items: [
      {
        id: 'boo-1',
        title: 'Persoonlijk bericht achterlaten',
        description: 'Wil je een brief, audio- of videoboodschap achterlaten voor specifieke mensen?',
        urgency: 'low',
        actionLabel: 'Bericht maken',
      },
    ],
  },
];

export function getFilteredChapters(situation: {
  hasPartner: boolean | null;
  hasChildren: boolean | null;
  housingType: 'huur' | 'koop' | 'anders' | null;
}, onboarding?: {
  hasTestament: 'ja' | 'nee' | 'weet-niet' | null;
  preferenceMode: 'digitaal' | 'analoog' | null;
}): Chapter[] {
  return CHAPTERS.map((chapter) => ({
    ...chapter,
    items: chapter.items.filter((item) => {
      if (item.requiresPartner && !situation.hasPartner) return false;
      if (item.requiresChildren && !situation.hasChildren) return false;
      if (item.requiresHuur && situation.housingType !== 'huur') return false;
      if (item.requiresKoop && situation.housingType !== 'koop') return false;
      if (item.requiresNoTestament && onboarding?.hasTestament === 'ja') return false;
      if (item.requiresDigitaal && onboarding?.preferenceMode === 'analoog') return false;
      if (item.requiresAnaloog && onboarding?.preferenceMode === 'digitaal') return false;
      // Show testament check item only if they already have one
      if (item.id === 'jur-1b' && onboarding?.hasTestament !== 'ja') return false;
      return true;
    }),
  })).filter((chapter) => chapter.items.length > 0);
}

// Flattened list for backward compat
export function getFilteredChecklist(situation: {
  hasPartner: boolean | null;
  hasChildren: boolean | null;
  housingType: 'huur' | 'koop' | 'anders' | null;
}): ChecklistItem[] {
  return getFilteredChapters(situation).flatMap((ch) => ch.items);
}

// Legacy CATEGORIES export
export const CATEGORIES = CHAPTERS.map((ch) => ({
  key: ch.key,
  label: ch.label,
  icon: ch.icon,
}));
