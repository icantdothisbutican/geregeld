export interface ChecklistItem {
  id: string;
  category: string;
  categoryIcon: string;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  requiresPartner?: boolean;
  requiresChildren?: boolean;
  requiresHuur?: boolean;
  requiresKoop?: boolean;
}

export const CATEGORIES = [
  { key: 'juridisch', label: 'Juridisch', icon: '⚖️' },
  { key: 'financieel', label: 'Financieel', icon: '💰' },
  { key: 'woning', label: 'Woning', icon: '🏠' },
  { key: 'digitaal', label: 'Digitaal', icon: '📱' },
  { key: 'contacten', label: 'Contacten', icon: '👥' },
  { key: 'uitvaart', label: 'Uitvaartwensen', icon: '🕯️' },
  { key: 'kinderen', label: 'Kinderen & Huisdieren', icon: '👶' },
  { key: 'boodschappen', label: 'Persoonlijke Boodschappen', icon: '💌' },
];

export const ALL_CHECKLIST_ITEMS: ChecklistItem[] = [
  // Juridisch
  {
    id: 'jur-1',
    category: 'juridisch',
    categoryIcon: '⚖️',
    title: 'Testament laten opstellen',
    description: 'Een testament regelt wie wat erft en voorkomt conflicten. Zonder testament geldt het wettelijk erfrecht.',
    urgency: 'high',
  },
  {
    id: 'jur-2',
    category: 'juridisch',
    categoryIcon: '⚖️',
    title: 'Levenstestament opstellen',
    description: 'Hierin regel je wie beslissingen voor je mag nemen als je dat zelf niet meer kunt (medisch en financieel).',
    urgency: 'high',
  },
  {
    id: 'jur-3',
    category: 'juridisch',
    categoryIcon: '⚖️',
    title: 'Samenlevingscontract regelen',
    description: 'Zonder samenlevingscontract heeft je partner juridisch bijna geen rechten op jullie bezittingen.',
    urgency: 'high',
    requiresPartner: true,
  },
  {
    id: 'jur-4',
    category: 'juridisch',
    categoryIcon: '⚖️',
    title: 'Geregistreerd partnerschap of huwelijk overwegen',
    description: 'Dit geeft je partner de sterkste juridische positie bij overlijden.',
    urgency: 'medium',
    requiresPartner: true,
  },

  // Financieel
  {
    id: 'fin-1',
    category: 'financieel',
    categoryIcon: '💰',
    title: 'Bankrekeningen documenteren',
    description: 'Leg vast bij welke banken je rekeningen hebt en hoe nabestaanden toegang krijgen.',
    urgency: 'high',
  },
  {
    id: 'fin-2',
    category: 'financieel',
    categoryIcon: '💰',
    title: 'Verzekeringen op een rij zetten',
    description: 'Uitvaartverzekering, levensverzekering, zorgverzekering — leg de polisgegevens vast.',
    urgency: 'high',
  },
  {
    id: 'fin-3',
    category: 'financieel',
    categoryIcon: '💰',
    title: 'Pensioengegevens vastleggen',
    description: 'Noteer je pensioenfonds en eventueel nabestaandenpensioen.',
    urgency: 'medium',
  },
  {
    id: 'fin-4',
    category: 'financieel',
    categoryIcon: '💰',
    title: 'Lopende abonnementen inventariseren',
    description: 'Maak een lijst van alle abonnementen zodat nabestaanden deze kunnen opzeggen.',
    urgency: 'low',
  },
  {
    id: 'fin-5',
    category: 'financieel',
    categoryIcon: '💰',
    title: 'Schulden en leningen documenteren',
    description: 'Leg vast of je schulden of leningen hebt, zodat nabestaanden weten wat er speelt.',
    urgency: 'medium',
  },

  // Woning
  {
    id: 'won-1',
    category: 'woning',
    categoryIcon: '🏠',
    title: 'Huurcontract veiligstellen',
    description: 'Zorg dat je partner weet waar het huurcontract ligt en op wiens naam het staat.',
    urgency: 'high',
    requiresHuur: true,
  },
  {
    id: 'won-2',
    category: 'woning',
    categoryIcon: '🏠',
    title: 'Hypotheekgegevens vastleggen',
    description: 'Documenteer je hypotheekverstrekker, voorwaarden, en of er een overlijdensrisicoverzekering is.',
    urgency: 'high',
    requiresKoop: true,
  },
  {
    id: 'won-3',
    category: 'woning',
    categoryIcon: '🏠',
    title: 'Woningverzekering controleren',
    description: 'Controleer of de woning goed verzekerd is en leg de polisgegevens vast.',
    urgency: 'medium',
  },
  {
    id: 'won-4',
    category: 'woning',
    categoryIcon: '🏠',
    title: 'Sleutels en toegang regelen',
    description: 'Zorg dat iemand een reservesleutel heeft en weet hoe het alarm werkt.',
    urgency: 'low',
  },

  // Digitaal
  {
    id: 'dig-1',
    category: 'digitaal',
    categoryIcon: '📱',
    title: 'Telefoon-toegang regelen',
    description: 'Leg je pincode of ontgrendelingsmethode vast zodat nabestaanden bij je telefoon kunnen.',
    urgency: 'high',
  },
  {
    id: 'dig-2',
    category: 'digitaal',
    categoryIcon: '📱',
    title: 'E-mail toegang documenteren',
    description: 'Toegang tot je e-mail is cruciaal voor nabestaanden om accounts en abonnementen te vinden.',
    urgency: 'high',
  },
  {
    id: 'dig-3',
    category: 'digitaal',
    categoryIcon: '📱',
    title: 'Social media wensen vastleggen',
    description: 'Wil je dat je accounts worden verwijderd of omgezet naar een herdenkingspagina?',
    urgency: 'low',
  },
  {
    id: 'dig-4',
    category: 'digitaal',
    categoryIcon: '📱',
    title: 'Cloud-opslag en bestanden',
    description: 'Leg vast waar je belangrijke bestanden opslaat (iCloud, Google Drive, etc.).',
    urgency: 'medium',
  },

  // Contacten
  {
    id: 'con-1',
    category: 'contacten',
    categoryIcon: '👥',
    title: 'Contactpersonenlijst maken',
    description: 'Maak een lijst van mensen die geïnformeerd moeten worden bij overlijden.',
    urgency: 'high',
  },
  {
    id: 'con-2',
    category: 'contacten',
    categoryIcon: '👥',
    title: 'Werkgever informatie vastleggen',
    description: 'Noteer je werkgever, HR-contactpersoon, en eventuele nabestaandenregelingen.',
    urgency: 'medium',
  },
  {
    id: 'con-3',
    category: 'contacten',
    categoryIcon: '👥',
    title: 'Huisarts en medische contacten',
    description: 'Leg de gegevens van je huisarts en eventuele specialisten vast.',
    urgency: 'medium',
  },

  // Uitvaart
  {
    id: 'uit-1',
    category: 'uitvaart',
    categoryIcon: '🕯️',
    title: 'Crematie of begraven kiezen',
    description: 'Leg vast of je gecremeerd of begraven wilt worden.',
    urgency: 'medium',
  },
  {
    id: 'uit-2',
    category: 'uitvaart',
    categoryIcon: '🕯️',
    title: 'Uitvaartlocatie aangeven',
    description: 'Heb je een voorkeur voor een specifieke locatie? (kerk, aula, buiten, thuis)',
    urgency: 'low',
  },
  {
    id: 'uit-3',
    category: 'uitvaart',
    categoryIcon: '🕯️',
    title: 'Muziek en sprekers vastleggen',
    description: 'Welke muziek wil je? Wie mag er spreken?',
    urgency: 'low',
  },

  // Kinderen & huisdieren
  {
    id: 'kin-1',
    category: 'kinderen',
    categoryIcon: '👶',
    title: 'Voogdij regelen voor kinderen',
    description: 'Leg vast wie er voor je kinderen zorgt als jij er niet meer bent. Dit moet in een testament.',
    urgency: 'high',
    requiresChildren: true,
  },
  {
    id: 'kin-2',
    category: 'kinderen',
    categoryIcon: '👶',
    title: 'Financiële voorziening voor kinderen',
    description: 'Denk aan een levensverzekering of spaarregeling voor je kinderen.',
    urgency: 'high',
    requiresChildren: true,
  },
  {
    id: 'kin-3',
    category: 'kinderen',
    categoryIcon: '👶',
    title: 'Huisdieren onderbrengen',
    description: 'Leg vast wie er voor je huisdieren zorgt als jij er niet meer bent.',
    urgency: 'medium',
  },

  // Persoonlijke boodschappen
  {
    id: 'boo-1',
    category: 'boodschappen',
    categoryIcon: '💌',
    title: 'Persoonlijk bericht achterlaten',
    description: 'Wil je een brief, audio- of videoboodschap achterlaten voor specifieke mensen?',
    urgency: 'low',
  },
];

export function getFilteredChecklist(situation: {
  hasPartner: boolean | null;
  hasChildren: boolean | null;
  housingType: 'huur' | 'koop' | 'anders' | null;
}): ChecklistItem[] {
  return ALL_CHECKLIST_ITEMS.filter((item) => {
    if (item.requiresPartner && !situation.hasPartner) return false;
    if (item.requiresChildren && !situation.hasChildren) return false;
    if (item.requiresHuur && situation.housingType !== 'huur') return false;
    if (item.requiresKoop && situation.housingType !== 'koop') return false;
    return true;
  });
}
