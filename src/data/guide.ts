export interface GuideStep {
  step: number;
  title: string;
  description: string;
  timing: string;
  duration: string;
  flowId?: string;
  details: string[];
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    step: 1,
    title: 'Overlijden laten vaststellen',
    description: 'Bel de huisarts of 112 om het overlijden officieel te laten vaststellen.',
    timing: 'Direct',
    duration: '15 min',
    flowId: 'guide-1',
    details: [
      'Bij overlijden thuis: bel de huisarts',
      'Bij onverwacht overlijden: bel 112',
      'De arts stelt een verklaring van overlijden op',
      'Dit document heb je nodig voor alle vervolgstappen',
    ],
  },
  {
    step: 2,
    title: 'Uitvaartondernemer bellen',
    description: 'Neem binnen 24 uur contact op met een uitvaartondernemer.',
    timing: 'Binnen 24 uur',
    duration: '30 min',
    flowId: 'guide-2',
    details: [
      'Check of de overledene een uitvaartverzekering had',
      'De uitvaartondernemer begeleidt je bij de praktische zaken',
      'Zij regelen het vervoer van de overledene',
      'Bespreek de wensen (crematie/begraven, locatie, etc.)',
    ],
  },
  {
    step: 3,
    title: 'Overlijden melden bij gemeente',
    description: 'Vraag een akte van overlijden aan bij de gemeente.',
    timing: 'Binnen 5 werkdagen',
    duration: '30 min',
    flowId: 'guide-3',
    details: [
      'Je hebt de verklaring van overlijden nodig',
      'En een geldig identiteitsbewijs van de overledene',
      'Vraag meerdere kopieeen aan',
      'De gemeente schrijft de overledene uit uit de BRP',
    ],
  },
  {
    step: 4,
    title: 'Werkgever informeren',
    description: 'Informeer de werkgever van de overledene zo snel mogelijk.',
    timing: 'Binnen 1-2 dagen',
    duration: '15 min',
    flowId: 'guide-4',
    details: [
      'Vraag naar eventuele nabestaandenregelingen',
      'Bespreek de laatste salarisbetaling',
      'Vraag naar pensioenregelingen',
      'Informeer ook je eigen werkgever voor bijzonder verlof',
    ],
  },
  {
    step: 5,
    title: 'Banken informeren',
    description: 'Meld het overlijden bij alle banken.',
    timing: 'Binnen een week',
    duration: '30 min',
    flowId: 'guide-5',
    details: [
      'De bank blokkeert de rekeningen van de overledene',
      'Een en/of-rekening blijft toegankelijk voor de mederekeninghouder',
      'Je hebt de akte van overlijden nodig',
      'Vraag naar de procedure voor vrijgave van tegoeden',
    ],
  },
  {
    step: 6,
    title: 'Verzekeringen informeren',
    description: 'Meld het overlijden bij alle verzekeringsmaatschappijen.',
    timing: 'Binnen een week',
    duration: '30 min',
    flowId: 'guide-6',
    details: [
      'Uitvaartverzekering: dien direct een claim in',
      'Levensverzekering: vraag naar de uitkering',
      'Zorgverzekering: zeg op per overlijdensdatum',
      'Auto-, woning- en inboedelverzekering: pas aan of zeg op',
    ],
  },
  {
    step: 7,
    title: 'Rouwkaarten versturen',
    description: 'Stel familie, vrienden en bekenden op de hoogte.',
    timing: 'Binnen een week',
    duration: '45 min',
    flowId: 'guide-7',
    details: [
      'Maak een lijst van alle mensen die geinformeerd moeten worden',
      'Overweeg ook een online condoleancepagina',
      'Vergeet werkcontacten en buren niet',
      'Verstuur kaarten per post en digitaal',
    ],
  },
  {
    step: 8,
    title: 'Uitvaart organiseren',
    description: 'Organiseer de uitvaart in overleg met de uitvaartondernemer.',
    timing: 'Binnen 6 werkdagen',
    duration: '2-3 uur',
    details: [
      'Kies tussen crematie of begraven',
      'Bepaal de locatie en het tijdstip',
      'Kies muziek, sprekers en invulling van de dienst',
      'Regel bloemen, catering en eventuele condoleance',
    ],
  },
  {
    step: 9,
    title: 'Erfenis regelen',
    description: 'Schakel een notaris in voor de afwikkeling van de nalatenschap.',
    timing: 'Binnen 3 maanden',
    duration: '1-2 uur + afspraak',
    details: [
      'Check of er een testament is bij het Centraal Testamentenregister',
      'De notaris maakt een verklaring van erfrecht op',
      'Hiermee krijgen erfgenamen toegang tot bankrekeningen',
      'Aangifte erfbelasting moet binnen 8 maanden',
    ],
  },
  {
    step: 10,
    title: 'Abonnementen en contracten opzeggen',
    description: 'Zeg alle lopende abonnementen en contracten op.',
    timing: 'Binnen 1-3 maanden',
    duration: '1 uur',
    details: [
      'Telefoon en internet',
      'Streamingdiensten (Netflix, Spotify, etc.)',
      'Sportschool, kranten, tijdschriften',
      'Huurcontract of hypotheek aanpassen',
      'Social media accounts verwijderen of omzetten',
    ],
  },
];
