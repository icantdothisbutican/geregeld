export interface FormField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'multiline' | 'password' | 'phone' | 'email' | 'number';
  sensitive?: boolean; // saved to vault
}

export interface FlowStep {
  title: string;
  description: string;
  actionType: 'info' | 'call' | 'link' | 'form' | 'confirm';
  actionLabel?: string;
  actionUrl?: string;
  actionPhone?: string;
  details?: string[];
  formFields?: FormField[];
  vaultCategory?: 'document' | 'password' | 'note';
  vaultTitle?: string; // title for vault entry
}

export interface Flow {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  steps: FlowStep[];
}

export const FLOWS: Record<string, Flow> = {
  'jur-1': {
    id: 'jur-1',
    title: 'Testament opstellen',
    subtitle: 'Vind een notaris en maak een afspraak',
    duration: '30 min + afspraak',
    steps: [
      {
        title: 'Waarom een testament?',
        description: 'Zonder testament bepaalt de wet wie je erfgenamen zijn. Met een testament bepaal je zelf wie wat krijgt.',
        actionType: 'info',
        details: [
          'Je bepaalt zelf wie wat erft',
          'Je kunt een executeur benoemen die alles regelt',
          'Je kunt de belastingdruk voor nabestaanden verlagen',
          'Kostprijs: tussen de 300 en 600 euro',
        ],
      },
      {
        title: 'Zoek een notaris bij jou in de buurt',
        description: 'Via de Koninklijke Notariele Beroepsorganisatie vind je eenvoudig een notaris.',
        actionType: 'link',
        actionLabel: 'Zoek een notaris',
        actionUrl: 'https://www.notaris.nl/notaris-zoeken',
      },
      {
        title: 'Noteer je notaris',
        description: 'Vul de gegevens van je notaris in zodat je nabestaanden weten bij wie ze moeten zijn.',
        actionType: 'form',
        formFields: [
          { key: 'notaris_naam', label: 'Naam notaris', placeholder: 'Bijv. Notariskantoor De Vries', type: 'text', sensitive: true },
          { key: 'notaris_telefoon', label: 'Telefoonnummer', placeholder: '020 123 4567', type: 'phone', sensitive: true },
          { key: 'notaris_adres', label: 'Adres', placeholder: 'Straat, stad', type: 'text', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Notaris gegevens',
      },
      {
        title: 'Afspraak gemaakt?',
        description: 'Markeer deze stap als afgerond zodra je een afspraak hebt gemaakt.',
        actionType: 'confirm',
        actionLabel: 'Ja, afspraak staat',
      },
    ],
  },
  'jur-1b': {
    id: 'jur-1b',
    title: 'Testament controleren',
    subtitle: 'Controleer of je testament nog actueel is',
    duration: '10 min',
    steps: [
      {
        title: 'Wanneer moet je je testament herzien?',
        description: 'Een testament is niet voor altijd. Controleer het na grote levensgebeurtenissen.',
        actionType: 'info',
        details: [
          'Na een scheiding of nieuwe relatie',
          'Na de geboorte van een kind',
          'Na een verhuizing (zeker naar het buitenland)',
          'Na een grote verandering in je financiele situatie',
          'Als een genoemde erfgenaam is overleden',
        ],
      },
      {
        title: 'Alles nog actueel?',
        description: 'Als er iets gewijzigd moet worden, neem dan contact op met je notaris.',
        actionType: 'confirm',
        actionLabel: 'Ja, testament is actueel',
      },
    ],
  },
  'jur-2': {
    id: 'jur-2',
    title: 'Levenstestament opstellen',
    subtitle: 'Regel wie beslissingen voor je neemt',
    duration: '30 min + afspraak',
    steps: [
      {
        title: 'Wat is een levenstestament?',
        description: 'In een levenstestament leg je vast wie beslissingen voor je mag nemen als je dat zelf niet meer kunt.',
        actionType: 'info',
        details: [
          'Medische beslissingen (behandeling stoppen, reanimatie)',
          'Financiele beslissingen (bankzaken, belastingen)',
          'Persoonlijke beslissingen (woonplek, verzorging)',
          'Kostprijs: tussen de 400 en 800 euro bij een notaris',
        ],
      },
      {
        title: 'Wie wordt je gevolmachtigde?',
        description: 'Vul in wie jouw beslissingen mag nemen.',
        actionType: 'form',
        formFields: [
          { key: 'gevolmachtigde_naam', label: 'Naam gevolmachtigde', placeholder: 'Volledige naam', type: 'text', sensitive: true },
          { key: 'gevolmachtigde_relatie', label: 'Relatie', placeholder: 'Bijv. partner, kind', type: 'text', sensitive: true },
          { key: 'gevolmachtigde_telefoon', label: 'Telefoonnummer', placeholder: '06 1234 5678', type: 'phone', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Gevolmachtigde levenstestament',
      },
      {
        title: 'Geregeld?',
        description: 'Markeer als afgerond wanneer je een levenstestament hebt opgesteld.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },
  'jur-3': {
    id: 'jur-3',
    title: 'Samenlevingscontract regelen',
    subtitle: 'Bescherm je partner juridisch',
    duration: '20 min + afspraak',
    steps: [
      {
        title: 'Waarom een samenlevingscontract?',
        description: 'Zonder samenlevingscontract heeft je partner juridisch bijna geen rechten op jullie gezamenlijke bezittingen bij overlijden.',
        actionType: 'info',
        details: [
          'Je partner heeft geen automatisch recht op je pensioen',
          'Je partner erft niet automatisch van je',
          'Jullie woning kan in gevaar komen',
          'Een notarieel samenlevingscontract biedt de meeste bescherming',
        ],
      },
      {
        title: 'Zoek een notaris',
        description: 'Een notaris helpt jullie een contract op maat te maken.',
        actionType: 'link',
        actionLabel: 'Zoek een notaris',
        actionUrl: 'https://www.notaris.nl/notaris-zoeken',
      },
      {
        title: 'Geregeld?',
        description: 'Markeer als afgerond wanneer het contract is getekend.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },
  'fin-1': {
    id: 'fin-1',
    title: 'Bankrekeningen documenteren',
    subtitle: 'Geef nabestaanden inzicht in je bankzaken',
    duration: '15 min',
    steps: [
      {
        title: 'Welke banken gebruik je?',
        description: 'Maak een overzicht van al je bankrekeningen. We slaan dit veilig op in je kluis.',
        actionType: 'info',
        details: [
          'Denk aan: ING, Rabobank, ABN AMRO, SNS, Triodos, ASN, Bunq, Revolut',
          'Noteer het rekeningnummer (IBAN)',
          'Is het een en/of-rekening of een persoonlijke rekening?',
          'Heb je een beleggingsrekening?',
        ],
      },
      {
        title: 'Betaalrekening(en)',
        description: 'Vul je betaalrekening(en) in. Deze gegevens worden beveiligd opgeslagen in je kluis.',
        actionType: 'form',
        formFields: [
          { key: 'bank1_naam', label: 'Bank', placeholder: 'Bijv. ING', type: 'text', sensitive: true },
          { key: 'bank1_iban', label: 'IBAN', placeholder: 'NL00 INGB 0000 0000 00', type: 'text', sensitive: true },
          { key: 'bank1_type', label: 'Soort rekening', placeholder: 'Bijv. betaalrekening, en/of', type: 'text', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Betaalrekening',
      },
      {
        title: 'Spaarrekening(en)',
        description: 'Heb je spaar- of beleggingsrekeningen? Vul die hier in.',
        actionType: 'form',
        formFields: [
          { key: 'spaar1_bank', label: 'Bank', placeholder: 'Bijv. Rabobank', type: 'text', sensitive: true },
          { key: 'spaar1_iban', label: 'IBAN', placeholder: 'NL00 RABO 0000 0000 00', type: 'text', sensitive: true },
          { key: 'spaar1_type', label: 'Soort', placeholder: 'Bijv. spaarrekening, beleggingen', type: 'text', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Spaar-/beleggingsrekening',
      },
      {
        title: 'Overzicht compleet?',
        description: 'Je bankgegevens zijn veilig opgeslagen in je kluis.',
        actionType: 'confirm',
        actionLabel: 'Ja, overzicht is compleet',
      },
    ],
  },
  'fin-2': {
    id: 'fin-2',
    title: 'Verzekeringen op een rij',
    subtitle: 'Inventariseer al je verzekeringen',
    duration: '20 min',
    steps: [
      {
        title: 'Welke verzekeringen heb je?',
        description: 'Vul je verzekeringen in. We slaan de gegevens veilig op.',
        actionType: 'form',
        formFields: [
          { key: 'verz_uitvaart', label: 'Uitvaartverzekering', placeholder: 'Verzekeraar + polisnummer', type: 'text', sensitive: true },
          { key: 'verz_leven', label: 'Levensverzekering', placeholder: 'Verzekeraar + polisnummer', type: 'text', sensitive: true },
          { key: 'verz_zorg', label: 'Zorgverzekering', placeholder: 'Verzekeraar + polisnummer', type: 'text', sensitive: true },
          { key: 'verz_auto', label: 'Autoverzekering', placeholder: 'Verzekeraar + kenteken', type: 'text', sensitive: true },
          { key: 'verz_woning', label: 'Woning/inboedel', placeholder: 'Verzekeraar + polisnummer', type: 'text', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Verzekeringen overzicht',
      },
      {
        title: 'Controleer je uitvaartverzekering',
        description: 'Controleer of de dekking nog voldoende is.',
        actionType: 'link',
        actionLabel: 'Vergelijk op Independer',
        actionUrl: 'https://www.independer.nl/uitvaartverzekering',
      },
      {
        title: 'Overzicht klaar?',
        description: 'Je verzekeringsgegevens staan veilig in je kluis.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },
  'dig-1': {
    id: 'dig-1',
    title: 'Wachtwoorden digitaal delen',
    subtitle: 'Deel veilig via je telefoon-instellingen',
    duration: '10 min',
    steps: [
      {
        title: 'iPhone: Deel via Familiedeling',
        description: 'Apple heeft een ingebouwde functie om wachtwoorden te delen.',
        actionType: 'info',
        details: [
          'Ga naar Instellingen > Wachtwoorden',
          'Tik op het +-icoon en kies "Nieuwe gedeelde groep"',
          'Voeg je vertrouwenspersoon toe',
          'Selecteer welke wachtwoorden je wilt delen',
        ],
      },
      {
        title: 'Android: Deel via Google Wachtwoordmanager',
        description: 'Google biedt ook een functie om wachtwoorden te delen.',
        actionType: 'info',
        details: [
          'Ga naar passwords.google.com',
          'Selecteer "Familie" in het menu',
          'Voeg familieleden toe aan je Google Family',
          'Deel specifieke wachtwoorden met ze',
        ],
      },
      {
        title: 'Wachtwoorden gedeeld?',
        description: 'Je vertrouwenspersoon heeft nu toegang tot je belangrijkste accounts.',
        actionType: 'confirm',
        actionLabel: 'Ja, alles gedeeld',
      },
    ],
  },
  'dig-1b': {
    id: 'dig-1b',
    title: 'Wachtwoorden opslaan',
    subtitle: 'Sla je belangrijkste wachtwoorden veilig op',
    duration: '15 min',
    steps: [
      {
        title: 'Je belangrijkste accounts',
        description: 'Vul je wachtwoorden in. Alles wordt versleuteld opgeslagen in je beveiligde kluis.',
        actionType: 'form',
        formFields: [
          { key: 'pw_email', label: 'E-mail wachtwoord', placeholder: 'Bijv. Gmail, Outlook', type: 'password', sensitive: true },
          { key: 'pw_email_adres', label: 'E-mailadres', placeholder: 'naam@voorbeeld.nl', type: 'email', sensitive: true },
          { key: 'pw_telefoon', label: 'Telefoon pincode', placeholder: 'Bijv. 123456', type: 'password', sensitive: true },
          { key: 'pw_digid', label: 'DigiD gebruikersnaam', placeholder: 'Je DigiD login', type: 'text', sensitive: true },
        ],
        vaultCategory: 'password',
        vaultTitle: 'Belangrijkste accounts',
      },
      {
        title: 'Bank & financieel',
        description: 'Wachtwoorden voor bankieren en financiele apps.',
        actionType: 'form',
        formFields: [
          { key: 'pw_bank', label: 'Bank app/website', placeholder: 'Inloggegevens', type: 'password', sensitive: true },
          { key: 'pw_icloud', label: 'iCloud / Google Account', placeholder: 'Wachtwoord', type: 'password', sensitive: true },
        ],
        vaultCategory: 'password',
        vaultTitle: 'Bank & cloud wachtwoorden',
      },
      {
        title: 'Social media (optioneel)',
        description: 'Wil je dat je nabestaanden toegang hebben tot je social media?',
        actionType: 'form',
        formFields: [
          { key: 'pw_facebook', label: 'Facebook', placeholder: 'Wachtwoord (optioneel)', type: 'password', sensitive: true },
          { key: 'pw_instagram', label: 'Instagram', placeholder: 'Wachtwoord (optioneel)', type: 'password', sensitive: true },
          { key: 'social_wens', label: 'Wat wil je met je accounts?', placeholder: 'Bijv. verwijderen, herdenkingspagina', type: 'text', sensitive: true },
        ],
        vaultCategory: 'password',
        vaultTitle: 'Social media accounts',
      },
      {
        title: 'Alles opgeslagen',
        description: 'Je wachtwoorden staan veilig in je kluis. Alleen jij en je vertrouwenspersoon hebben toegang.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },
  'con-1': {
    id: 'con-1',
    title: 'Contactenlijst maken',
    subtitle: 'Wie moet geinformeerd worden bij overlijden?',
    duration: '15 min',
    steps: [
      {
        title: 'Denk aan deze groepen',
        description: 'Maak een lijst van iedereen die geinformeerd moet worden.',
        actionType: 'info',
        details: [
          'Directe familie (ouders, broers/zussen, kinderen)',
          'Schoonfamilie',
          'Goede vrienden',
          'Buren',
          'Collega\'s en werkgever',
          'Huisarts en specialisten',
          'Verenigingen en clubs',
        ],
      },
      {
        title: 'Belangrijkste contacten',
        description: 'Vul de belangrijkste contactpersonen in. Later kun je er meer toevoegen.',
        actionType: 'form',
        formFields: [
          { key: 'contact1_naam', label: 'Naam contact 1', placeholder: 'Volledige naam', type: 'text', sensitive: true },
          { key: 'contact1_tel', label: 'Telefoonnummer', placeholder: '06 1234 5678', type: 'phone', sensitive: true },
          { key: 'contact1_relatie', label: 'Relatie', placeholder: 'Bijv. broer, vriendin', type: 'text', sensitive: true },
          { key: 'contact2_naam', label: 'Naam contact 2', placeholder: 'Volledige naam', type: 'text', sensitive: true },
          { key: 'contact2_tel', label: 'Telefoonnummer', placeholder: '06 1234 5678', type: 'phone', sensitive: true },
        ],
        vaultCategory: 'note',
        vaultTitle: 'Contactpersonenlijst',
      },
      {
        title: 'Contacten toegevoegd?',
        description: 'Je kunt altijd meer contacten toevoegen via het profiel.',
        actionType: 'confirm',
        actionLabel: 'Contacten toegevoegd',
      },
    ],
  },
  'con-2': {
    id: 'con-2',
    title: 'Rouwkaarten voorbereiden',
    subtitle: 'Klaar om te versturen wanneer het nodig is',
    duration: '20 min',
    steps: [
      {
        title: 'Kies een stijl',
        description: 'Kies een stijl die bij je past.',
        actionType: 'info',
        details: [
          'Klassiek: wit met zwarte rand',
          'Modern: minimalistisch met zachte kleuren',
          'Persoonlijk: met een foto of eigen ontwerp',
          'Natuur: met bloemen of landschap',
        ],
      },
      {
        title: 'PostNL integratie',
        description: 'Je nabestaanden kunnen met een druk op de knop rouwkaarten versturen via PostNL.',
        actionType: 'info',
        details: [
          'Alle adressen worden automatisch ingevuld',
          'PostNL print en verstuurt de kaarten',
          'Kostprijs: circa 2-3 euro per kaart inclusief postzegel',
          'Levertijd: volgende werkdag',
        ],
      },
      {
        title: 'Stijl gekozen?',
        description: 'Je rouwkaarten staan klaar.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },

  // Guide flows
  'guide-1': {
    id: 'guide-1',
    title: 'Overlijden laten vaststellen',
    subtitle: 'De eerste stap na een overlijden',
    duration: '15 min',
    steps: [
      {
        title: 'Bel de juiste persoon',
        description: 'Bij een verwacht overlijden thuis bel je de huisarts. Bij een onverwacht overlijden bel je 112.',
        actionType: 'call',
        actionLabel: 'Bel huisarts',
        actionPhone: 'tel:',
      },
      {
        title: 'De arts komt langs',
        description: 'De arts stelt het overlijden officieel vast en maakt een verklaring van overlijden op.',
        actionType: 'info',
        details: [
          'De arts controleert of het een natuurlijk overlijden is',
          'Je ontvangt een A-verklaring (verklaring van overlijden)',
          'En een B-verklaring (doodsoorzaakverklaring, gaat naar CBS)',
        ],
      },
      {
        title: 'Verklaring ontvangen?',
        description: 'Berg de verklaring van overlijden veilig op.',
        actionType: 'confirm',
        actionLabel: 'Ja, ontvangen',
      },
    ],
  },
  'guide-2': {
    id: 'guide-2',
    title: 'Uitvaartondernemer regelen',
    subtitle: 'Laat je begeleiden door een professional',
    duration: '30 min',
    steps: [
      {
        title: 'Check de uitvaartverzekering',
        description: 'Controleer eerst of de overledene een uitvaartverzekering had.',
        actionType: 'info',
        details: [
          'Check de administratie van de overledene',
          'Bel de verzekeraar als je het polisnummer hebt',
          'Sommige werkgevers bieden een uitvaartverzekering',
        ],
      },
      {
        title: 'Zoek een uitvaartondernemer',
        description: 'Als er geen uitvaartverzekering is, kun je zelf een uitvaartondernemer kiezen.',
        actionType: 'link',
        actionLabel: 'Zoek op uitvaart.nl',
        actionUrl: 'https://www.uitvaart.nl/uitvaartondernemers',
      },
      {
        title: 'Noteer de gegevens',
        description: 'Sla de gegevens van de uitvaartondernemer op.',
        actionType: 'form',
        formFields: [
          { key: 'uitvaart_naam', label: 'Naam uitvaartondernemer', placeholder: 'Bijv. Dela, Monuta', type: 'text', sensitive: true },
          { key: 'uitvaart_tel', label: 'Telefoonnummer', placeholder: '0800 1234', type: 'phone', sensitive: true },
          { key: 'uitvaart_ref', label: 'Referentienummer', placeholder: 'Indien van toepassing', type: 'text', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Uitvaartondernemer',
      },
      {
        title: 'Uitvaartondernemer gebeld?',
        description: 'De uitvaartondernemer neemt veel praktische zaken uit handen.',
        actionType: 'confirm',
        actionLabel: 'Ja, geregeld',
      },
    ],
  },
  'guide-3': {
    id: 'guide-3',
    title: 'Overlijden melden bij gemeente',
    subtitle: 'Vraag een akte van overlijden aan',
    duration: '30 min',
    steps: [
      {
        title: 'Wat heb je nodig?',
        description: 'Verzamel de volgende documenten.',
        actionType: 'info',
        details: [
          'Verklaring van overlijden (van de arts)',
          'Identiteitsbewijs van de overledene',
          'Jouw eigen identiteitsbewijs',
          'Eventueel: trouwboekje',
        ],
      },
      {
        title: 'Ga naar de gemeente',
        description: 'Meld het overlijden bij de gemeente waar de persoon is overleden. Vraag minimaal 5 afschriften aan.',
        actionType: 'link',
        actionLabel: 'Zoek je gemeente',
        actionUrl: 'https://www.rijksoverheid.nl/onderwerpen/overlijden/aangifte-van-overlijden',
      },
      {
        title: 'Akte ontvangen?',
        description: 'De gemeente schrijft de overledene uit uit de BRP.',
        actionType: 'confirm',
        actionLabel: 'Ja, akte ontvangen',
      },
    ],
  },
  'guide-4': {
    id: 'guide-4',
    title: 'Werkgever informeren',
    subtitle: 'Regel praktische zaken met de werkgever',
    duration: '15 min',
    steps: [
      {
        title: 'Werkgever van de overledene',
        description: 'Vul de gegevens van de werkgever in zodat nabestaanden weten wie ze moeten bellen.',
        actionType: 'form',
        formFields: [
          { key: 'werkgever_naam', label: 'Werkgever', placeholder: 'Bedrijfsnaam', type: 'text', sensitive: true },
          { key: 'werkgever_contact', label: 'Contactpersoon / HR', placeholder: 'Naam', type: 'text', sensitive: true },
          { key: 'werkgever_tel', label: 'Telefoonnummer', placeholder: '020 123 4567', type: 'phone', sensitive: true },
        ],
        vaultCategory: 'document',
        vaultTitle: 'Werkgever gegevens',
        details: [
          'Vraag naar het laatste salaris en vakantiegeld',
          'Vraag naar eventueel nabestaandenpensioen',
          'Bespreek het inleveren van bedrijfseigendommen',
        ],
      },
      {
        title: 'Werkgever geinformeerd?',
        description: 'De werkgever is op de hoogte.',
        actionType: 'confirm',
        actionLabel: 'Ja, geinformeerd',
      },
    ],
  },
  'guide-5': {
    id: 'guide-5',
    title: 'Banken informeren',
    subtitle: 'Meld het overlijden bij alle banken',
    duration: '30 min',
    steps: [
      {
        title: 'Telefoonnummers banken',
        description: 'Bel de bank(en) om het overlijden te melden.',
        actionType: 'info',
        details: [
          'ING: 020 22 888 00',
          'Rabobank: 030 712 60 00',
          'ABN AMRO: 0900 0024',
          'SNS: 030 633 30 00',
          'Triodos: 030 693 65 00',
          'ASN: 070 356 93 72',
        ],
      },
      {
        title: 'Wat heb je nodig?',
        description: 'De bank vraagt om de volgende documenten.',
        actionType: 'info',
        details: [
          'Akte van overlijden',
          'Verklaring van erfrecht (via de notaris)',
          'Jouw identiteitsbewijs',
          'Een en/of-rekening blijft toegankelijk voor de mederekeninghouder',
        ],
      },
      {
        title: 'Alle banken geinformeerd?',
        description: 'De banken blokkeren de rekeningen en starten de procedure.',
        actionType: 'confirm',
        actionLabel: 'Ja, alle banken gebeld',
      },
    ],
  },
  'guide-6': {
    id: 'guide-6',
    title: 'Verzekeringen informeren',
    subtitle: 'Meld het overlijden bij alle verzekeraars',
    duration: '30 min',
    steps: [
      {
        title: 'Welke verzekeringen?',
        description: 'Meld het overlijden bij alle verzekeringsmaatschappijen.',
        actionType: 'info',
        details: [
          'Uitvaartverzekering: dien direct een claim in',
          'Levensverzekering: vraag naar de uitkering',
          'Zorgverzekering: zeg op per overlijdensdatum',
          'Auto-, woning-, inboedelverzekering: pas aan of zeg op',
        ],
      },
      {
        title: 'Zorgverzekeraar opzeggen',
        description: 'De zorgverzekering stopt automatisch op de dag van overlijden.',
        actionType: 'link',
        actionLabel: 'Vind je zorgverzekeraar',
        actionUrl: 'https://www.zorgverzekeringslijn.nl',
      },
      {
        title: 'Alle verzekeraars geinformeerd?',
        description: 'Bewaar de bevestigingen.',
        actionType: 'confirm',
        actionLabel: 'Ja, alles gemeld',
      },
    ],
  },
  'guide-7': {
    id: 'guide-7',
    title: 'Rouwkaarten versturen',
    subtitle: 'Informeer familie, vrienden en bekenden',
    duration: '45 min',
    steps: [
      {
        title: 'Maak een verzendlijst',
        description: 'Wie moet er geinformeerd worden?',
        actionType: 'info',
        details: [
          'Familie en schoonfamilie',
          'Vrienden en buren',
          'Collega\'s en zakelijke contacten',
          'Verenigingen en clubs',
        ],
      },
      {
        title: 'Overweeg ook digitaal',
        description: 'Naast fysieke kaarten kun je ook een online condoleancepagina maken.',
        actionType: 'link',
        actionLabel: 'Bekijk online condoleance',
        actionUrl: 'https://www.inmemori.com/nl',
      },
      {
        title: 'Iedereen geinformeerd?',
        description: 'Alle belangrijke personen zijn op de hoogte gesteld.',
        actionType: 'confirm',
        actionLabel: 'Ja, verstuurd',
      },
    ],
  },
};
