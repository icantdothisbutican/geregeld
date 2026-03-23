export interface FlowStep {
  title: string;
  description: string;
  actionType: 'info' | 'call' | 'link' | 'form' | 'confirm';
  actionLabel?: string;
  actionUrl?: string;
  actionPhone?: string;
  details?: string[];
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
        description: 'Zonder testament bepaalt de wet wie je erfgenamen zijn. Met een testament bepaal je zelf wie wat krijgt, en voorkom je conflicten.',
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
        title: 'Maak een afspraak',
        description: 'Bel de notaris of maak online een afspraak. Neem het volgende mee:',
        actionType: 'info',
        details: [
          'Geldig identiteitsbewijs',
          'Overzicht van je bezittingen en schulden',
          'Gegevens van je erfgenamen',
          'Eventuele wensen over voogdij (bij kinderen)',
        ],
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
        description: 'In een levenstestament leg je vast wie beslissingen voor je mag nemen als je dat zelf niet meer kunt. Dit geldt tijdens je leven, niet na overlijden.',
        actionType: 'info',
        details: [
          'Medische beslissingen (behandeling stoppen, reanimatie)',
          'Financiele beslissingen (bankzaken, belastingen)',
          'Persoonlijke beslissingen (woonplek, verzorging)',
          'Kostprijs: tussen de 400 en 800 euro bij een notaris',
          'Gratis registratie mogelijk via het CLTR',
        ],
      },
      {
        title: 'Meer informatie opzoeken',
        description: 'Het Centraal Levenstestamentenregister heeft alle informatie die je nodig hebt.',
        actionType: 'link',
        actionLabel: 'Bekijk op notaris.nl',
        actionUrl: 'https://www.notaris.nl/levenstestament',
      },
      {
        title: 'Geregeld?',
        description: 'Markeer als afgerond wanneer je een levenstestament hebt opgesteld of een afspraak hebt gemaakt.',
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
        description: 'Maak een overzicht van al je bankrekeningen. Denk aan betaalrekeningen, spaarrekeningen, en beleggingsrekeningen.',
        actionType: 'info',
        details: [
          'ING, Rabobank, ABN AMRO, SNS, Triodos, ASN, Bunq, Revolut',
          'Noteer het rekeningnummer (IBAN)',
          'Is het een en/of-rekening of een persoonlijke rekening?',
          'Heb je een beleggingsrekening?',
        ],
      },
      {
        title: 'Hoe krijgen nabestaanden toegang?',
        description: 'Na overlijden moeten nabestaanden een akte van overlijden en verklaring van erfrecht overleggen aan de bank.',
        actionType: 'info',
        details: [
          'Een en/of-rekening blijft toegankelijk voor de mederekeninghouder',
          'Persoonlijke rekeningen worden geblokkeerd',
          'De bank vraagt om een verklaring van erfrecht (via de notaris)',
          'Tip: bewaar je bankpasjes op een bekende plek',
        ],
      },
      {
        title: 'Overzicht compleet?',
        description: 'Heb je alle bankrekeningen genoteerd en weet je vertrouwenspersoon waar deze informatie staat?',
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
        description: 'Maak een overzicht van al je verzekeringen en de polisgegevens.',
        actionType: 'info',
        details: [
          'Uitvaartverzekering (wie is de verzekeraar?)',
          'Levensverzekering (wat is het verzekerd bedrag?)',
          'Zorgverzekering',
          'Autoverzekering',
          'Woonhuisverzekering / inboedelverzekering',
          'Aansprakelijkheidsverzekering',
          'Rechtsbijstandverzekering',
        ],
      },
      {
        title: 'Controleer je uitvaartverzekering',
        description: 'Als je een uitvaartverzekering hebt, is het slim om te controleren of de dekking nog voldoende is.',
        actionType: 'link',
        actionLabel: 'Vergelijk op Independer',
        actionUrl: 'https://www.independer.nl/uitvaartverzekering',
      },
      {
        title: 'Overzicht klaar?',
        description: 'Bewaar je polisgegevens op een plek die je vertrouwenspersoon kent.',
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
        description: 'Apple heeft een ingebouwde functie om wachtwoorden te delen met een vertrouwd persoon.',
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
        description: 'Google biedt ook een functie om wachtwoorden te delen met vertrouwde personen.',
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
    title: 'Wachtwoorden op papier',
    subtitle: 'Print een veilig overzicht',
    duration: '15 min',
    steps: [
      {
        title: 'Welke wachtwoorden zijn belangrijk?',
        description: 'Schrijf de wachtwoorden op die je nabestaanden nodig hebben.',
        actionType: 'info',
        details: [
          'E-mail (dit is de sleutel tot alle andere accounts)',
          'Telefoon pincode / ontgrendelcode',
          'Bankieren app',
          'DigiD',
          'Social media (als je wilt dat ze accounts beheren)',
          'iCloud / Google account',
        ],
      },
      {
        title: 'Bewaar het veilig',
        description: 'Berg het papier op in een afgesloten plek die je vertrouwenspersoon kent. Denk aan een kluis of verzegelde envelop bij de notaris.',
        actionType: 'info',
        details: [
          'Gebruik een afgesloten la of kluis',
          'Of bewaar het in een verzegelde envelop bij je notaris',
          'Vertel alleen je vertrouwenspersoon waar het ligt',
          'Update het jaarlijks als je wachtwoorden wijzigt',
        ],
      },
      {
        title: 'Alles opgeschreven?',
        description: 'Je vertrouwenspersoon weet waar de wachtwoorden liggen.',
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
          'School of kinderopvang (bij kinderen)',
        ],
      },
      {
        title: 'Voeg contacten toe',
        description: 'Voeg de belangrijkste contacten toe in de app. Later kun je via PostNL met een druk op de knop rouwkaarten versturen.',
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
        description: 'Kies een stijl die bij je past. Je kunt later altijd aanpassen.',
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
        description: 'Zodra je contacten hebt toegevoegd, kunnen je nabestaanden met een druk op de knop rouwkaarten versturen via PostNL.',
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
        description: 'Je rouwkaarten staan klaar. Je nabestaanden hoeven alleen nog op "verstuur" te drukken.',
        actionType: 'confirm',
        actionLabel: 'Afgerond',
      },
    ],
  },

  // Guide flows - "wat te doen bij overlijden" actionable versions
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
        description: 'De arts stelt het overlijden officieel vast en maakt een verklaring van overlijden op. Bewaar dit document goed — je hebt het nodig voor alle vervolgstappen.',
        actionType: 'info',
        details: [
          'De arts controleert of het een natuurlijk overlijden is',
          'Bij een niet-natuurlijk overlijden wordt de politie ingeschakeld',
          'Je ontvangt een A-verklaring (verklaring van overlijden)',
          'En een B-verklaring (doodsoorzaakverklaring, gaat naar CBS)',
        ],
      },
      {
        title: 'Verklaring ontvangen?',
        description: 'Berg de verklaring van overlijden veilig op. Je hebt dit document nodig bij de gemeente, bank, en verzekeraar.',
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
        description: 'Controleer eerst of de overledene een uitvaartverzekering had. Vaak is hierin al een uitvaartondernemer opgenomen.',
        actionType: 'info',
        details: [
          'Check de administratie van de overledene',
          'Bel de verzekeraar als je het polisnummer hebt',
          'Sommige werkgevers bieden een uitvaartverzekering als secundaire arbeidsvoorwaarde',
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
        title: 'Uitvaartondernemer gebeld?',
        description: 'De uitvaartondernemer neemt veel praktische zaken uit handen: vervoer, kist, bloemen, locatie.',
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
        description: 'Verzamel de volgende documenten voordat je naar de gemeente gaat.',
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
        description: 'Je moet het overlijden melden bij de gemeente waar de persoon is overleden (niet waar diegene woonde). De meeste gemeentes bieden dit ook online aan.',
        actionType: 'link',
        actionLabel: 'Zoek je gemeente',
        actionUrl: 'https://www.rijksoverheid.nl/onderwerpen/overlijden/aangifte-van-overlijden',
      },
      {
        title: 'Vraag meerdere afschriften',
        description: 'Vraag minimaal 5 afschriften van de akte van overlijden aan. Je hebt ze nodig voor de bank, verzekeringen, werkgever, en notaris.',
        actionType: 'info',
      },
      {
        title: 'Akte ontvangen?',
        description: 'De gemeente schrijft de overledene uit uit de Basisregistratie Personen (BRP).',
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
        title: 'Neem contact op',
        description: 'Informeer de werkgever van de overledene zo snel mogelijk. Bel bij voorkeur de direct leidinggevende of HR.',
        actionType: 'info',
        details: [
          'Vraag naar het laatste salaris en vakantiegeld',
          'Vraag naar eventueel nabestaandenpensioen',
          'Vraag naar een eventuele uitkering bij overlijden',
          'Bespreek het inleveren van bedrijfseigendommen',
        ],
      },
      {
        title: 'Vergeet je eigen werkgever niet',
        description: 'Als je zelf werkt, heb je recht op bijzonder verlof. De duur hangt af van je relatie met de overledene en je CAO.',
        actionType: 'info',
        details: [
          'Partner of kind: meestal 4 dagen',
          'Ouder, broer/zus: meestal 2 dagen',
          'Schoonfamilie: meestal 1-2 dagen',
          'Check je CAO of personeelshandboek',
        ],
      },
      {
        title: 'Werkgever geinformeerd?',
        description: 'Beide werkgevers (van de overledene en van jezelf) zijn op de hoogte.',
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
        title: 'Welke bank?',
        description: 'Meld het overlijden bij elke bank waar de overledene een rekening had.',
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
          'Let op: een en/of-rekening blijft toegankelijk voor de mederekeninghouder',
        ],
      },
      {
        title: 'Alle banken geinformeerd?',
        description: 'De banken blokkeren de rekeningen en starten de procedure voor vrijgave van tegoeden.',
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
          'Aansprakelijkheidsverzekering: pas aan',
        ],
      },
      {
        title: 'Zorgverzekeraar opzeggen',
        description: 'De zorgverzekering stopt automatisch op de dag van overlijden. Meld het wel, zodat eventuele premie wordt terugbetaald.',
        actionType: 'link',
        actionLabel: 'Vind je zorgverzekeraar',
        actionUrl: 'https://www.zorgverzekeringslijn.nl',
      },
      {
        title: 'Alle verzekeraars geinformeerd?',
        description: 'Bewaar de bevestigingen die je ontvangt van de verzekeraars.',
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
        description: 'Wie moet er geinformeerd worden? Gebruik je contactenlijst in Geregeld als basis.',
        actionType: 'info',
        details: [
          'Familie en schoonfamilie',
          'Vrienden en buren',
          'Collega\'s en zakelijke contacten',
          'Verenigingen en clubs',
          'School of kinderopvang',
        ],
      },
      {
        title: 'Verstuur via PostNL',
        description: 'Als er contacten in Geregeld staan met adresgegevens, kun je rouwkaarten direct via PostNL laten versturen.',
        actionType: 'info',
        details: [
          'Kies een ontwerp uit de templates',
          'Adressen worden automatisch ingevuld',
          'PostNL print en verstuurt de kaarten',
          'Levertijd: volgende werkdag',
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
