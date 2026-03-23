export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  duration: string;
  hasFlow?: boolean;
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
  label: string;
  description: string;
  items: ChecklistItem[];
}

export const CHAPTERS: Chapter[] = [
  {
    key: 'juridisch',
    label: 'Juridisch',
    description: 'Zorg dat je rechten en wensen vastliggen',
    items: [
      {
        id: 'jur-1',
        title: 'Testament laten opstellen',
        description: 'Een testament regelt wie wat erft en voorkomt conflicten.',
        urgency: 'high',
        duration: '30 min + afspraak',
        hasFlow: true,
        actionLabel: 'Notaris zoeken',
        requiresNoTestament: true,
      },
      {
        id: 'jur-1b',
        title: 'Testament controleren',
        description: 'Controleer of je testament nog actueel is — zeker na een verhuizing, scheiding of geboorte.',
        urgency: 'medium',
        duration: '10 min',
        hasFlow: true,
        actionLabel: 'Controleren',
      },
      {
        id: 'jur-2',
        title: 'Levenstestament opstellen',
        description: 'Regel wie beslissingen voor je mag nemen als je dat zelf niet meer kunt.',
        urgency: 'high',
        duration: '30 min + afspraak',
        hasFlow: true,
        actionLabel: 'Meer informatie',
      },
      {
        id: 'jur-3',
        title: 'Samenlevingscontract regelen',
        description: 'Zonder samenlevingscontract heeft je partner juridisch bijna geen rechten.',
        urgency: 'high',
        duration: '20 min + afspraak',
        hasFlow: true,
        requiresPartner: true,
      },
      {
        id: 'jur-4',
        title: 'Geregistreerd partnerschap of huwelijk overwegen',
        description: 'Dit geeft je partner de sterkste juridische positie bij overlijden.',
        urgency: 'medium',
        duration: '15 min',
        requiresPartner: true,
      },
    ],
  },
  {
    key: 'financieel',
    label: 'Financieel',
    description: 'Geef nabestaanden inzicht in je financien',
    items: [
      {
        id: 'fin-1',
        title: 'Bankrekeningen documenteren',
        description: 'Leg vast bij welke banken je rekeningen hebt.',
        urgency: 'high',
        duration: '15 min',
        hasFlow: true,
        actionLabel: 'Invullen',
      },
      {
        id: 'fin-2',
        title: 'Verzekeringen op een rij zetten',
        description: 'Uitvaartverzekering, levensverzekering, zorgverzekering — leg de polisgegevens vast.',
        urgency: 'high',
        duration: '20 min',
        hasFlow: true,
        actionLabel: 'Inventariseren',
      },
      {
        id: 'fin-3',
        title: 'Pensioengegevens vastleggen',
        description: 'Noteer je pensioenfonds en eventueel nabestaandenpensioen.',
        urgency: 'medium',
        duration: '10 min',
      },
      {
        id: 'fin-4',
        title: 'Lopende abonnementen inventariseren',
        description: 'Maak een lijst van alle abonnementen zodat nabestaanden deze kunnen opzeggen.',
        urgency: 'low',
        duration: '15 min',
      },
      {
        id: 'fin-5',
        title: 'Schulden en leningen documenteren',
        description: 'Leg vast of je schulden of leningen hebt.',
        urgency: 'medium',
        duration: '10 min',
      },
    ],
  },
  {
    key: 'woning',
    label: 'Woning',
    description: 'Regel alles rondom je woonsituatie',
    items: [
      {
        id: 'won-1',
        title: 'Huurcontract veiligstellen',
        description: 'Zorg dat nabestaanden weten waar het huurcontract ligt.',
        urgency: 'high',
        duration: '5 min',
        requiresHuur: true,
      },
      {
        id: 'won-2',
        title: 'Hypotheekgegevens vastleggen',
        description: 'Documenteer je hypotheekverstrekker en of er een overlijdensrisicoverzekering is.',
        urgency: 'high',
        duration: '10 min',
        requiresKoop: true,
      },
      {
        id: 'won-3',
        title: 'Woningverzekering controleren',
        description: 'Controleer of de woning goed verzekerd is.',
        urgency: 'medium',
        duration: '10 min',
      },
      {
        id: 'won-4',
        title: 'Sleutels en toegang regelen',
        description: 'Zorg dat iemand een reservesleutel heeft.',
        urgency: 'low',
        duration: '5 min',
      },
    ],
  },
  {
    key: 'digitaal',
    label: 'Digitale Toegang',
    description: 'Zorg dat je digitale leven toegankelijk is',
    items: [
      {
        id: 'dig-1',
        title: 'Wachtwoorden delen via vertrouwenspersoon',
        description: 'Deel je wachtwoorden veilig via je telefoon-instellingen of een wachtwoordmanager.',
        urgency: 'high',
        duration: '10 min',
        hasFlow: true,
        requiresDigitaal: true,
        actionLabel: 'Uitleg bekijken',
      },
      {
        id: 'dig-1b',
        title: 'Wachtwoorden opschrijven',
        description: 'Schrijf je belangrijkste wachtwoorden op en bewaar ze op een veilige plek.',
        urgency: 'high',
        duration: '15 min',
        hasFlow: true,
        requiresAnaloog: true,
        actionLabel: 'Starten',
      },
      {
        id: 'dig-2',
        title: 'E-mail toegang documenteren',
        description: 'Toegang tot je e-mail is cruciaal voor nabestaanden.',
        urgency: 'high',
        duration: '5 min',
      },
      {
        id: 'dig-3',
        title: 'Social media wensen vastleggen',
        description: 'Wil je dat je accounts worden verwijderd of omgezet naar een herdenkingspagina?',
        urgency: 'low',
        duration: '5 min',
      },
      {
        id: 'dig-4',
        title: 'Cloud-opslag en bestanden',
        description: 'Leg vast waar je belangrijke bestanden opslaat.',
        urgency: 'medium',
        duration: '5 min',
      },
    ],
  },
  {
    key: 'contacten',
    label: 'Contacten & Communicatie',
    description: 'Wie moet weten dat je er niet meer bent?',
    items: [
      {
        id: 'con-1',
        title: 'Contactpersonenlijst maken',
        description: 'Maak een lijst van mensen die geinformeerd moeten worden.',
        urgency: 'high',
        duration: '15 min',
        hasFlow: true,
        actionLabel: 'Lijst maken',
      },
      {
        id: 'con-2',
        title: 'Rouwkaarten voorbereiden',
        description: 'Bereid rouwkaarten voor die via PostNL verstuurd kunnen worden.',
        urgency: 'medium',
        duration: '20 min',
        hasFlow: true,
        actionLabel: 'Voorbereiden',
      },
      {
        id: 'con-3',
        title: 'Werkgever informatie vastleggen',
        description: 'Noteer je werkgever en HR-contactpersoon.',
        urgency: 'medium',
        duration: '5 min',
      },
      {
        id: 'con-4',
        title: 'Huisarts en medische contacten',
        description: 'Leg de gegevens van je huisarts en specialisten vast.',
        urgency: 'medium',
        duration: '5 min',
      },
    ],
  },
  {
    key: 'uitvaart',
    label: 'Uitvaartwensen',
    description: 'Leg vast hoe jij afscheid wilt nemen',
    items: [
      {
        id: 'uit-1',
        title: 'Crematie of begraven vastleggen',
        description: 'Je keuze wordt opgeslagen zodat je naasten niet hoeven te twijfelen.',
        urgency: 'medium',
        duration: '2 min',
      },
      {
        id: 'uit-2',
        title: 'Uitvaartlocatie aangeven',
        description: 'Heb je een voorkeur voor een specifieke locatie?',
        urgency: 'low',
        duration: '5 min',
      },
      {
        id: 'uit-3',
        title: 'Muziek en sprekers vastleggen',
        description: 'Welke muziek wil je? Wie mag er spreken?',
        urgency: 'low',
        duration: '10 min',
      },
    ],
  },
  {
    key: 'kinderen',
    label: 'Kinderen & Huisdieren',
    description: 'Zorg voor wie van je afhankelijk is',
    items: [
      {
        id: 'kin-1',
        title: 'Voogdij regelen voor kinderen',
        description: 'Leg vast wie er voor je kinderen zorgt. Dit moet in een testament.',
        urgency: 'high',
        duration: '30 min + afspraak',
        requiresChildren: true,
      },
      {
        id: 'kin-2',
        title: 'Financiele voorziening voor kinderen',
        description: 'Denk aan een levensverzekering of spaarregeling.',
        urgency: 'high',
        duration: '20 min',
        requiresChildren: true,
      },
      {
        id: 'kin-3',
        title: 'Huisdieren onderbrengen',
        description: 'Leg vast wie er voor je huisdieren zorgt.',
        urgency: 'medium',
        duration: '5 min',
      },
    ],
  },
  {
    key: 'boodschappen',
    label: 'Persoonlijke Boodschappen',
    description: 'Laat een persoonlijk bericht achter',
    items: [
      {
        id: 'boo-1',
        title: 'Persoonlijk bericht achterlaten',
        description: 'Schrijf een boodschap, wijsheid of vraag voor je naasten.',
        urgency: 'low',
        duration: '15 min',
        hasFlow: true,
        actionLabel: 'Bericht schrijven',
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
      if (item.id === 'jur-1b' && onboarding?.hasTestament !== 'ja') return false;
      return true;
    }),
  })).filter((chapter) => chapter.items.length > 0);
}

export function getFilteredChecklist(situation: {
  hasPartner: boolean | null;
  hasChildren: boolean | null;
  housingType: 'huur' | 'koop' | 'anders' | null;
}): ChecklistItem[] {
  return getFilteredChapters(situation).flatMap((ch) => ch.items);
}

export const CATEGORIES = CHAPTERS.map((ch) => ({
  key: ch.key,
  label: ch.label,
  icon: '',
}));
