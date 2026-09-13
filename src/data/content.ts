import type { Locale } from "@/i18n";

export type Localized = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type SectionId = "essays" | "reviews" | "translations" | "interviews";

export type Article = {
  slug: string;
  section: SectionId;
  topics: string[];
  author: string;
  date: string;
  readingTime: number;
  featured?: boolean;
  title: Localized;
  dek: Localized;
  body: LocalizedList;
};

export const topics = ["memory", "translation", "poetry", "cities", "classics", "form", "silence", "archives"];

export const topicLabels: Record<string, Localized> = {
  memory: { el: "Μνήμη", en: "Memory", de: "Erinnerung" },
  translation: { el: "Μετάφραση", en: "Translation", de: "Übersetzung" },
  poetry: { el: "Ποίηση", en: "Poetry", de: "Lyrik" },
  cities: { el: "Πόλεις", en: "Cities", de: "Städte" },
  classics: { el: "Κλασικά", en: "Classics", de: "Klassiker" },
  form: { el: "Φόρμα", en: "Form", de: "Form" },
  silence: { el: "Σιωπή", en: "Silence", de: "Stille" },
  archives: { el: "Αρχεία", en: "Archives", de: "Archive" },
};

export const sectionOrder: SectionId[] = ["essays", "reviews", "translations", "interviews"];

export const sectionBlurbs: Record<SectionId, Localized> = {
  essays: {
    el: "Εκτενή κείμενα για την ανάγνωση, τη μορφή και τη μνήμη.",
    en: "Long-form pieces on reading, form and memory.",
    de: "Längere Texte über Lesen, Form und Erinnerung.",
  },
  reviews: {
    el: "Κριτικές νέων και παλαιότερων εκδόσεων.",
    en: "Reviews of new and older editions.",
    de: "Kritiken zu neuen und älteren Ausgaben.",
  },
  translations: {
    el: "Μεταφράσεις με σημειώσεις του μεταφραστή.",
    en: "Translations with translator's notes.",
    de: "Übersetzungen mit Anmerkungen der Übersetzenden.",
  },
  interviews: {
    el: "Συνομιλίες με συγγραφείς, μεταφραστές και εκδότες.",
    en: "Conversations with writers, translators and publishers.",
    de: "Gespräche mit Autoren, Übersetzern und Verlagen.",
  },
};

export const articles: Article[] = [
  {
    slug: "the-margin-as-a-room",
    section: "essays",
    topics: ["form", "memory"],
    author: "Ελένη Βαρδάκη",
    date: "2026-02-18",
    readingTime: 12,
    featured: true,
    title: {
      el: "Το περιθώριο ως δωμάτιο",
      en: "The margin as a room",
      de: "Der Rand als Zimmer",
    },
    dek: {
      el: "Γιατί οι σημειώσεις στο περιθώριο ενός βιβλίου είναι το πιο ειλικρινές είδος γραφής.",
      en: "Why marginal notes are the most honest genre of writing.",
      de: "Warum Randnotizen die ehrlichste Form des Schreibens sind.",
    },
    body: {
      el: [
        "Κάθε αντίτυπο που έχει διαβαστεί σοβαρά κρατά ένα δεύτερο κείμενο στα άκρα του. Είναι γραμμένο βιαστικά, χωρίς αναγνώστη, και γι' αυτό λέει την αλήθεια.",
        "Στη λέσχη ζητάμε από τα μέλη να φέρνουν τα βιβλία τους ανοιγμένα σε μια σελίδα με σημειώσεις. Η συζήτηση ξεκινά πάντα από εκεί: όχι από τη γνώμη, αλλά από την στιγμή που κάτι μας σταμάτησε.",
        "Το περιθώριο δεν είναι χώρος αξιολόγησης. Είναι χώρος συντροφιάς. Ο αναγνώστης απαντά σε μια φράση όπως απαντά κανείς σε κάποιον που μιλά δίπλα του, με σύντομες λέξεις ή με ένα σκέτο σημάδι.",
        "Όταν ξαναδιαβάζουμε τις σημειώσεις μας μετά από χρόνια, δεν συναντάμε το βιβλίο. Συναντάμε τον εαυτό μας που διάβαζε. Αυτή η διπλή ανάγνωση είναι, νομίζω, το μόνο αρχείο που αξίζει να κρατάμε.",
      ],
      en: [
        "Every copy that has been read seriously keeps a second text along its edges. It is written quickly, for no reader, and for that reason it tells the truth.",
        "In the group we ask members to bring their books open at a page with notes. The discussion always begins there: not with an opinion, but with the moment something stopped us.",
        "The margin is not a place for judgement. It is a place for company. A reader answers a sentence the way one answers a person speaking nearby, in short words or with a bare mark.",
        "When we reread our notes years later we do not meet the book. We meet the person who was reading. That double reading is, I think, the only archive worth keeping.",
      ],
      de: [
        "Jedes Exemplar, das ernsthaft gelesen wurde, trägt an seinen Rändern einen zweiten Text. Er ist schnell geschrieben, für niemanden, und deshalb sagt er die Wahrheit.",
        "Im Lesekreis bitten wir die Mitglieder, ihre Bücher an einer Seite mit Notizen aufgeschlagen mitzubringen. Das Gespräch beginnt immer dort: nicht bei der Meinung, sondern bei dem Moment, der uns aufhielt.",
        "Der Rand ist kein Ort des Urteils. Er ist ein Ort der Gesellschaft. Man antwortet einem Satz wie einem Menschen, der neben einem spricht: kurz, oder nur mit einem Zeichen.",
        "Lesen wir unsere Notizen Jahre später wieder, treffen wir nicht das Buch. Wir treffen den Menschen, der las. Diese doppelte Lektüre ist wohl das einzige Archiv, das sich zu bewahren lohnt.",
      ],
    },
  },
  {
    slug: "a-city-read-twice",
    section: "essays",
    topics: ["cities", "memory"],
    author: "Ανδρέας Λιάκος",
    date: "2026-02-04",
    readingTime: 9,
    title: {
      el: "Μια πόλη διαβασμένη δύο φορές",
      en: "A city read twice",
      de: "Eine Stadt zweimal gelesen",
    },
    dek: {
      el: "Η Αθήνα μέσα από δύο μυθιστορήματα που χωρίζουν σαράντα χρόνια.",
      en: "Athens through two novels written forty years apart.",
      de: "Athen in zwei Romanen, die vierzig Jahre trennen.",
    },
    body: {
      el: [
        "Δύο μυθιστορήματα, ίδιοι δρόμοι, διαφορετικός θόρυβος. Στο πρώτο η πόλη είναι υπόσχεση, στο δεύτερο απόδειξη.",
        "Ο τόπος δεν αλλάζει τόσο όσο αλλάζει ο ρυθμός με τον οποίο τον διασχίζουμε. Η λογοτεχνία καταγράφει αυτόν τον ρυθμό ακριβέστερα από κάθε χάρτη.",
        "Διαβάζοντάς τα μαζί, καταλαβαίνουμε πως η μνήμη μιας πόλης δεν είναι συλλογική. Είναι ένα πλήθος ιδιωτικών διαδρομών που τυχαίνει να μοιράζονται ονόματα οδών.",
      ],
      en: [
        "Two novels, the same streets, a different noise. In the first the city is a promise; in the second it is evidence.",
        "A place changes less than the pace at which we cross it. Literature records that pace more precisely than any map.",
        "Read together, they show that a city's memory is not collective. It is a crowd of private routes that happen to share street names.",
      ],
      de: [
        "Zwei Romane, dieselben Straßen, ein anderer Lärm. Im ersten ist die Stadt ein Versprechen, im zweiten ein Beweis.",
        "Ein Ort verändert sich weniger als das Tempo, in dem wir ihn durchqueren. Literatur hält dieses Tempo genauer fest als jede Karte.",
        "Zusammen gelesen zeigen sie: Das Gedächtnis einer Stadt ist nicht kollektiv. Es ist eine Menge privater Wege, die zufällig Straßennamen teilen.",
      ],
    },
  },
  {
    slug: "notes-on-a-quiet-novel",
    section: "reviews",
    topics: ["silence", "form"],
    author: "Μαρίνα Ζέππου",
    date: "2026-01-27",
    readingTime: 7,
    featured: true,
    title: {
      el: "Σημειώσεις για ένα ήσυχο μυθιστόρημα",
      en: "Notes on a quiet novel",
      de: "Notizen zu einem stillen Roman",
    },
    dek: {
      el: "Ένα βιβλίο χωρίς πλοκή που κρατά τον αναγνώστη με τον τόνο του.",
      en: "A book with no plot that holds the reader by its tone.",
      de: "Ein Buch ohne Handlung, das durch seinen Ton hält.",
    },
    body: {
      el: [
        "Δεν συμβαίνει σχεδόν τίποτα και όμως δεν μπορείς να το αφήσεις. Η συγγραφέας δουλεύει με παύσεις, όπως ένας μουσικός.",
        "Η επιμέλεια είναι υποδειγματική: καμία πρόταση δεν εξηγεί την προηγούμενη. Ο αναγνώστης αναλαμβάνει τη σύνδεση και γι' αυτό μένει.",
        "Το βιβλίο θα απογοητεύσει όποιον ζητά κορύφωση. Θα ανταμείψει όποιον δέχεται πως η ένταση μπορεί να είναι ζήτημα ακουστικής.",
      ],
      en: [
        "Almost nothing happens and still you cannot put it down. The author works in pauses, like a musician.",
        "The editing is exemplary: no sentence explains the one before it. The reader takes on the connecting, and therefore stays.",
        "The book will disappoint anyone looking for a climax. It rewards anyone who accepts that tension can be a matter of acoustics.",
      ],
      de: [
        "Es geschieht fast nichts, und doch legt man es nicht weg. Die Autorin arbeitet mit Pausen, wie eine Musikerin.",
        "Das Lektorat ist vorbildlich: kein Satz erklärt den vorherigen. Die Verbindung übernimmt der Leser — und bleibt deshalb.",
        "Wer einen Höhepunkt sucht, wird enttäuscht. Wer annimmt, dass Spannung eine Frage der Akustik sein kann, wird belohnt.",
      ],
    },
  },
  {
    slug: "seven-versions-of-one-line",
    section: "translations",
    topics: ["translation", "poetry"],
    author: "Ίρις Κοντού",
    date: "2026-01-14",
    readingTime: 11,
    title: {
      el: "Επτά εκδοχές ενός στίχου",
      en: "Seven versions of one line",
      de: "Sieben Fassungen einer Zeile",
    },
    dek: {
      el: "Ένας στίχος, επτά μεταφράσεις και οι σημειώσεις που τις συνοδεύουν.",
      en: "One line, seven translations, and the notes that accompany them.",
      de: "Eine Zeile, sieben Übersetzungen und die Notizen dazu.",
    },
    body: {
      el: [
        "Ο στίχος έχει εννέα λέξεις. Οι επτά εκδοχές του διαφέρουν σε δύο: στο ρήμα και στο τελευταίο ουσιαστικό.",
        "Καμία δεν είναι λάθος. Κάθε μία επιλέγει τι θα θυσιάσει, τον ρυθμό ή την ακρίβεια, και το δηλώνει ανοιχτά στη σημείωση.",
        "Η μετάφραση δεν είναι αντιγραφή αλλά ερμηνεία υπό πίεση. Δημοσιεύουμε και τις απορρίψεις, γιατί εκεί φαίνεται η σκέψη.",
      ],
      en: [
        "The line has nine words. Its seven versions differ in two: the verb and the final noun.",
        "None is wrong. Each chooses what to sacrifice, rhythm or accuracy, and says so openly in the note.",
        "Translation is not copying but interpretation under pressure. We print the rejected drafts too, because that is where the thinking shows.",
      ],
      de: [
        "Die Zeile hat neun Wörter. Ihre sieben Fassungen unterscheiden sich in zwei: im Verb und im letzten Substantiv.",
        "Keine ist falsch. Jede entscheidet, was sie opfert — Rhythmus oder Genauigkeit — und sagt es offen in der Anmerkung.",
        "Übersetzen ist kein Kopieren, sondern Deuten unter Druck. Wir drucken auch die verworfenen Fassungen, denn dort zeigt sich das Denken.",
      ],
    },
  },
  {
    slug: "conversation-with-a-publisher",
    section: "interviews",
    topics: ["archives", "form"],
    author: "Νίκος Παπαδήμας",
    date: "2025-12-20",
    readingTime: 14,
    title: {
      el: "Συνομιλία με έναν εκδότη",
      en: "A conversation with a publisher",
      de: "Ein Gespräch mit einem Verleger",
    },
    dek: {
      el: "Για τα μικρά τιράζ, τη μακρά υπομονή και το κόστος της καλής επιμέλειας.",
      en: "On small print runs, long patience, and the cost of good editing.",
      de: "Über kleine Auflagen, lange Geduld und die Kosten guter Redaktion.",
    },
    body: {
      el: [
        "«Ένα βιβλίο που πουλάει αργά για δέκα χρόνια είναι καλύτερη επιχείρηση από ένα που πουλάει γρήγορα για δέκα εβδομάδες», λέει στην αρχή της συνομιλίας.",
        "Μιλά για τη σχέση με τους μεταφραστές σαν για σχέση με μουσικούς: τους δίνει χρόνο και δεν τους ζητά να παίξουν πιο δυνατά.",
        "Στο τέλος δείχνει τα αρχεία του: διορθωμένα δοκίμια σελίδων από τριάντα χρόνια. Το πιο ακριβό υλικό, λέει, είναι η προσοχή.",
      ],
      en: [
        "\u201cA book that sells slowly for ten years is a better business than one that sells fast for ten weeks,\u201d he says at the start.",
        "He speaks of translators the way one speaks of musicians: he gives them time and never asks them to play louder.",
        "At the end he shows his archive: corrected proofs going back thirty years. The most expensive material, he says, is attention.",
      ],
      de: [
        "\u201eEin Buch, das zehn Jahre langsam verkauft wird, ist ein besseres Geschäft als eines, das zehn Wochen schnell läuft\u201c, sagt er zu Beginn.",
        "Über Übersetzende spricht er wie über Musiker: Er gibt ihnen Zeit und bittet sie nie, lauter zu spielen.",
        "Am Ende zeigt er sein Archiv: korrigierte Fahnen aus dreißig Jahren. Das teuerste Material, sagt er, ist Aufmerksamkeit.",
      ],
    },
  },
  {
    slug: "against-the-summary",
    section: "essays",
    topics: ["form", "classics"],
    author: "Ελένη Βαρδάκη",
    date: "2025-12-06",
    readingTime: 8,
    title: {
      el: "Κατά της περίληψης",
      en: "Against the summary",
      de: "Gegen die Zusammenfassung",
    },
    dek: {
      el: "Τι χάνεται όταν ένα βιβλίο μπορεί να ειπωθεί σε μία παράγραφο.",
      en: "What is lost when a book can be told in one paragraph.",
      de: "Was verloren geht, wenn ein Buch in einem Absatz erzählbar ist.",
    },
    body: {
      el: [
        "Η περίληψη κρατά την πλοκή και πετά τον χρόνο. Όμως το βιβλίο ήταν ο χρόνος.",
        "Στα κλασικά κείμενα η επανάληψη δεν είναι αδυναμία της οικονομίας αλλά όργανο μνήμης. Η περίληψη τη διαγράφει πρώτη.",
        "Δεν προτείνω να μην μιλάμε για βιβλία. Προτείνω να μιλάμε για σκηνές, φράσεις και ρυθμό, δηλαδή για ό,τι δεν συνοψίζεται.",
      ],
      en: [
        "A summary keeps the plot and throws away the time. But the book was the time.",
        "In classical texts repetition is not an economic flaw but an instrument of memory. The summary deletes it first.",
        "I am not proposing that we stop talking about books. I propose we talk about scenes, sentences and pace, which is to say about what cannot be summarised.",
      ],
      de: [
        "Eine Zusammenfassung behält die Handlung und wirft die Zeit weg. Doch das Buch war die Zeit.",
        "In klassischen Texten ist Wiederholung kein Mangel an Ökonomie, sondern ein Instrument der Erinnerung. Die Zusammenfassung löscht sie zuerst.",
        "Ich schlage nicht vor, nicht über Bücher zu sprechen. Ich schlage vor, über Szenen, Sätze und Tempo zu sprechen — über das, was sich nicht zusammenfassen lässt.",
      ],
    },
  },
  {
    slug: "an-anthology-of-first-sentences",
    section: "reviews",
    topics: ["classics", "form"],
    author: "Μαρίνα Ζέππου",
    date: "2025-11-22",
    readingTime: 6,
    title: {
      el: "Μια ανθολογία πρώτων προτάσεων",
      en: "An anthology of first sentences",
      de: "Eine Anthologie erster Sätze",
    },
    dek: {
      el: "Ευφυής συλλογή που κινδυνεύει να γίνει παιχνίδι.",
      en: "A clever collection that risks becoming a game.",
      de: "Eine kluge Sammlung, die zum Spiel zu werden droht.",
    },
    body: {
      el: [
        "Οι πρώτες προτάσεις είναι υποσχέσεις. Απομονωμένες, γίνονται ατάκες.",
        "Ο ανθολόγος το ξέρει και προσπαθεί να το αντισταθμίσει με σχόλια. Τα καλύτερα σχόλια είναι εκεί όπου παραδέχεται πως η πρόταση δεν στέκει χωρίς το βιβλίο της.",
        "Ως εργαλείο διδασκαλίας, ο τόμος είναι χρήσιμος. Ως ανάγνωσμα, θέλει μικρές δόσεις.",
      ],
      en: [
        "First sentences are promises. Isolated, they become punchlines.",
        "The anthologist knows this and tries to compensate with commentary. The best notes are those admitting a sentence does not stand without its book.",
        "As a teaching tool the volume is useful. As reading it wants small doses.",
      ],
      de: [
        "Erste Sätze sind Versprechen. Isoliert werden sie Pointen.",
        "Der Herausgeber weiß das und versucht, es mit Kommentaren auszugleichen. Die besten Anmerkungen geben zu, dass ein Satz ohne sein Buch nicht steht.",
        "Als Lehrmittel ist der Band nützlich. Als Lektüre verlangt er kleine Dosen.",
      ],
    },
  },
  {
    slug: "letters-from-an-archive",
    section: "translations",
    topics: ["archives", "memory"],
    author: "Ίρις Κοντού",
    date: "2025-11-08",
    readingTime: 10,
    title: {
      el: "Γράμματα από ένα αρχείο",
      en: "Letters from an archive",
      de: "Briefe aus einem Archiv",
    },
    dek: {
      el: "Τέσσερα ανέκδοτα γράμματα σε πρώτη ελληνική μετάφραση.",
      en: "Four unpublished letters in a first translation.",
      de: "Vier unveröffentlichte Briefe in erster Übersetzung.",
    },
    body: {
      el: [
        "Τα γράμματα βρέθηκαν σε φάκελο με την ένδειξη «διάφορα». Η γραφή είναι βιαστική και τα περισσότερα δεν έχουν ημερομηνία.",
        "Μεταφράζοντας, κράτησα τα ασυντακτικά σημεία. Η διόρθωσή τους θα έκανε τον αποστολέα πιο ήρεμο απ' όσο ήταν.",
        "Το τέταρτο γράμμα σταματά στη μέση μιας πρότασης. Το δημοσιεύουμε όπως είναι.",
      ],
      en: [
        "The letters were found in a folder marked \u201cmiscellaneous\u201d. The hand is hurried and most are undated.",
        "In translating I kept the broken syntax. Repairing it would make the sender calmer than he was.",
        "The fourth letter stops mid-sentence. We print it as it is.",
      ],
      de: [
        "Die Briefe lagen in einer Mappe mit der Aufschrift \u201eVerschiedenes\u201c. Die Handschrift ist eilig, meist ohne Datum.",
        "Beim Übersetzen behielt ich die gebrochene Syntax. Sie zu glätten würde den Absender ruhiger machen, als er war.",
        "Der vierte Brief bricht mitten im Satz ab. Wir drucken ihn so.",
      ],
    },
  },
  {
    slug: "on-reading-aloud",
    section: "essays",
    topics: ["silence", "poetry"],
    author: "Ανδρέας Λιάκος",
    date: "2025-10-19",
    readingTime: 7,
    title: {
      el: "Για τη φωναχτή ανάγνωση",
      en: "On reading aloud",
      de: "Über das laute Lesen",
    },
    dek: {
      el: "Η δοκιμή που κανένα κείμενο δεν μπορεί να εξαπατήσει.",
      en: "The test no text can cheat.",
      de: "Die Prüfung, die kein Text bestehen kann, ohne ehrlich zu sein.",
    },
    body: {
      el: [
        "Διαβάστε δυνατά μια παράγραφο και θα ακούσετε αμέσως πού λείπει η ανάσα.",
        "Στις συναντήσεις μας ξεκινάμε πάντα με πέντε λεπτά φωναχτής ανάγνωσης. Η αίθουσα ησυχάζει μόνη της.",
        "Η φωνή δεν βελτιώνει το κείμενο. Το αποκαλύπτει, και αυτό αρκεί.",
      ],
      en: [
        "Read a paragraph aloud and you will hear at once where the breath is missing.",
        "Our meetings always begin with five minutes of reading aloud. The room quiets by itself.",
        "The voice does not improve a text. It exposes it, and that is enough.",
      ],
      de: [
        "Lesen Sie einen Absatz laut, und Sie hören sofort, wo der Atem fehlt.",
        "Unsere Treffen beginnen stets mit fünf Minuten lautem Lesen. Der Raum wird von selbst still.",
        "Die Stimme verbessert einen Text nicht. Sie legt ihn offen, und das genügt.",
      ],
    },
  },
  {
    slug: "a-translator-at-work",
    section: "interviews",
    topics: ["translation", "silence"],
    author: "Νίκος Παπαδήμας",
    date: "2025-10-02",
    readingTime: 13,
    title: {
      el: "Μια μεταφράστρια στη δουλειά",
      en: "A translator at work",
      de: "Eine Übersetzerin bei der Arbeit",
    },
    dek: {
      el: "Τέσσερις ώρες στο γραφείο μιας μεταφράστριας που δουλεύει με το χέρι.",
      en: "Four hours at the desk of a translator who works by hand.",
      de: "Vier Stunden am Schreibtisch einer Übersetzerin, die mit der Hand arbeitet.",
    },
    body: {
      el: [
        "Γράφει πρώτα με μολύβι, μετά καθαρογράφει. «Το πληκτρολόγιο με κάνει να αποφασίζω πολύ γρήγορα», λέει.",
        "Έχει τρία λεξικά ανοιχτά και κανένα δεν χρησιμοποιεί για ορισμούς· τα διαβάζει για τη συνήχηση των παραδειγμάτων.",
        "Στο τέλος της μέρας έχει κερδίσει μία σελίδα. Την διαβάζει δυνατά και σβήνει δύο επίθετα.",
      ],
      en: [
        "She drafts in pencil, then copies out clean. \u201cThe keyboard makes me decide too quickly,\u201d she says.",
        "Three dictionaries lie open and she uses none for definitions; she reads them for the sound of the examples.",
        "By the end of the day she has gained one page. She reads it aloud and deletes two adjectives.",
      ],
      de: [
        "Sie schreibt zuerst mit Bleistift, dann ins Reine. \u201eDie Tastatur lässt mich zu schnell entscheiden\u201c, sagt sie.",
        "Drei Wörterbücher liegen offen, keines nutzt sie für Definitionen; sie liest sie für den Klang der Beispiele.",
        "Am Ende des Tages hat sie eine Seite gewonnen. Sie liest sie laut und streicht zwei Adjektive.",
      ],
    },
  },
  {
    slug: "the-shelf-as-autobiography",
    section: "essays",
    topics: ["memory", "archives"],
    author: "Ελένη Βαρδάκη",
    date: "2025-09-15",
    readingTime: 9,
    title: {
      el: "Το ράφι ως αυτοβιογραφία",
      en: "The shelf as autobiography",
      de: "Das Regal als Autobiografie",
    },
    dek: {
      el: "Πώς η σειρά των βιβλίων μας λέει την ιστορία που δεν γράψαμε.",
      en: "How the order of our books tells the story we never wrote.",
      de: "Wie die Ordnung unserer Bücher die ungeschriebene Geschichte erzählt.",
    },
    body: {
      el: [
        "Καμία βιβλιοθήκη δεν είναι ταξινομημένη όπως λέει ο ιδιοκτήτης της. Πάντα υπάρχει ένα ράφι με την αλήθεια.",
        "Εκεί βρίσκονται τα βιβλία που δεν τελειώσαμε, τα δώρα που δεν διαβάσαμε και δύο αντίτυπα του ίδιου τίτλου.",
        "Ταξινομώ κάθε λίγα χρόνια. Δεν είναι νοικοκυριό· είναι μια μορφή αναθεώρησης.",
      ],
      en: [
        "No library is arranged the way its owner claims. There is always one shelf holding the truth.",
        "That is where the unfinished books live, the unread gifts, and two copies of the same title.",
        "I reorder every few years. It is not housekeeping; it is a form of revision.",
      ],
      de: [
        "Keine Bibliothek ist so geordnet, wie ihr Besitzer behauptet. Immer gibt es ein Regal mit der Wahrheit.",
        "Dort stehen die unbeendeten Bücher, die ungelesenen Geschenke und zwei Exemplare desselben Titels.",
        "Ich ordne alle paar Jahre neu. Das ist keine Hausarbeit, sondern eine Form der Revision.",
      ],
    },
  },
  {
    slug: "poems-in-a-waiting-room",
    section: "reviews",
    topics: ["poetry", "cities"],
    author: "Μαρίνα Ζέππου",
    date: "2025-09-01",
    readingTime: 5,
    title: {
      el: "Ποιήματα σε μια αίθουσα αναμονής",
      en: "Poems in a waiting room",
      de: "Gedichte in einem Warteraum",
    },
    dek: {
      el: "Μια συλλογή γραμμένη σε δημόσιους χώρους και για δημόσιους χώρους.",
      en: "A collection written in public spaces, and for them.",
      de: "Eine Sammlung, in öffentlichen Räumen und für sie geschrieben.",
    },
    body: {
      el: [
        "Τα ποιήματα είναι σύντομα επειδή γράφτηκαν όρθια. Αυτό φαίνεται και είναι το καλύτερό τους στοιχείο.",
        "Ο ποιητής ακούει καλύτερα απ' όσο περιγράφει. Οι διάλογοι που καταγράφει σώζουν τη συλλογή από τη διάθεση της καταγγελίας.",
        "Ένα βιβλίο για την τσέπη, όχι για το γραφείο.",
      ],
      en: [
        "The poems are short because they were written standing up. It shows, and it is their best quality.",
        "The poet hears better than he describes. The overheard dialogue saves the book from a tone of complaint.",
        "A book for the pocket, not for the desk.",
      ],
      de: [
        "Die Gedichte sind kurz, weil sie im Stehen entstanden. Man merkt es, und das ist ihre größte Stärke.",
        "Der Dichter hört besser, als er beschreibt. Die aufgeschnappten Dialoge retten den Band vor dem Ton der Klage.",
        "Ein Buch für die Tasche, nicht für den Schreibtisch.",
      ],
    },
  },
];

export type Meeting = {
  id: string;
  date: string;
  time: string;
  mode: "online" | "inPerson";
  seatsLeft: number;
  book: string;
  bookAuthor: string;
  place: Localized;
  focus: Localized;
};

export const meetings: Meeting[] = [
  {
    id: "m-1",
    date: "2026-03-12",
    time: "19:30",
    mode: "inPerson",
    seatsLeft: 6,
    book: "Ο κηπουρός των ονομάτων",
    bookAuthor: "S. Halberg",
    place: { el: "Βιβλιοπωλείο Ίαμβος, Αθήνα", en: "Iambos Bookshop, Athens", de: "Buchhandlung Iambos, Athen" },
    focus: {
      el: "Πρώτο μέρος: η αφήγηση σε δεύτερο πρόσωπο.",
      en: "Part one: narration in the second person.",
      de: "Erster Teil: Erzählen in der zweiten Person.",
    },
  },
  {
    id: "m-2",
    date: "2026-03-26",
    time: "20:00",
    mode: "online",
    seatsLeft: 14,
    book: "Ο κηπουρός των ονομάτων",
    bookAuthor: "S. Halberg",
    place: { el: "Διαδικτυακή αίθουσα", en: "Online room", de: "Online-Raum" },
    focus: {
      el: "Δεύτερο μέρος και κλείσιμο του κύκλου.",
      en: "Part two and the close of the cycle.",
      de: "Zweiter Teil und Abschluss des Zyklus.",
    },
  },
  {
    id: "m-3",
    date: "2026-04-09",
    time: "19:30",
    mode: "inPerson",
    seatsLeft: 0,
    book: "Παύσεις",
    bookAuthor: "L. Marchetti",
    place: { el: "Στοά Αρσακείου, Αθήνα", en: "Arsakeio Arcade, Athens", de: "Arsakeio-Passage, Athen" },
    focus: {
      el: "Η σιωπή ως δομικό υλικό.",
      en: "Silence as building material.",
      de: "Stille als Baustoff.",
    },
  },
  {
    id: "m-4",
    date: "2026-04-23",
    time: "20:00",
    mode: "online",
    seatsLeft: 11,
    book: "Παύσεις",
    bookAuthor: "L. Marchetti",
    place: { el: "Διαδικτυακή αίθουσα", en: "Online room", de: "Online-Raum" },
    focus: {
      el: "Μετάφραση και ρυθμός: σύγκριση δύο εκδοχών.",
      en: "Translation and rhythm: comparing two versions.",
      de: "Übersetzung und Rhythmus: zwei Fassungen im Vergleich.",
    },
  },
];

export type PastRead = { title: string; author: string; year: string; note: Localized };

export const pastReads: PastRead[] = [
  {
    title: "Η δεύτερη επιστολή",
    author: "M. Ferrand",
    year: "2026",
    note: { el: "Επιστολικό μυθιστόρημα.", en: "An epistolary novel.", de: "Ein Briefroman." },
  },
  {
    title: "Χάρτες χωρίς κλίμακα",
    author: "A. Vrettou",
    year: "2025",
    note: { el: "Δοκίμια για τον τόπο.", en: "Essays on place.", de: "Essays über den Ort." },
  },
  {
    title: "Ο κόμπος",
    author: "J. Ostermann",
    year: "2025",
    note: { el: "Νουβέλα σε μια νύχτα.", en: "A novella in one night.", de: "Eine Novelle in einer Nacht." },
  },
  {
    title: "Αντίγραφα",
    author: "T. Sarris",
    year: "2024",
    note: { el: "Ποιήματα και παραλλαγές.", en: "Poems and variants.", de: "Gedichte und Varianten." },
  },
];

export const currentBook = {
  title: "Ο κηπουρός των ονομάτων",
  author: "S. Halberg",
  pages: 288,
  translator: "Ίρις Κοντού",
  description: {
    el: "Ένας κηπουρός καταγράφει τα ονόματα όσων περνούν από τον κήπο. Ένα βιβλίο για τη μνήμη, τη λίστα και την φροντίδα.",
    en: "A gardener records the names of everyone who passes through the garden. A book about memory, lists and care.",
    de: "Ein Gärtner notiert die Namen aller, die den Garten durchqueren. Ein Buch über Erinnerung, Listen und Sorge.",
  } satisfies Localized,
};

export type TeamMember = { name: string; initials: string; role: Localized; bio: Localized };

export const team: TeamMember[] = [
  {
    name: "Ελένη Βαρδάκη",
    initials: "ΕΒ",
    role: { el: "Διευθύντρια σύνταξης", en: "Editor-in-chief", de: "Chefredakteurin" },
    bio: {
      el: "Γράφει για τη μορφή και τη μνήμη. Ίδρυσε τη λέσχη το 2019.",
      en: "Writes on form and memory. Founded the group in 2019.",
      de: "Schreibt über Form und Erinnerung. Gründete den Kreis 2019.",
    },
  },
  {
    name: "Ίρις Κοντού",
    initials: "ΙΚ",
    role: { el: "Επιμελήτρια μεταφράσεων", en: "Translations editor", de: "Redaktion Übersetzungen" },
    bio: {
      el: "Μεταφράζει από τα γερμανικά και τα ιταλικά.",
      en: "Translates from German and Italian.",
      de: "Übersetzt aus dem Deutschen und Italienischen.",
    },
  },
  {
    name: "Ανδρέας Λιάκος",
    initials: "ΑΛ",
    role: { el: "Συντάκτης", en: "Staff writer", de: "Redakteur" },
    bio: {
      el: "Ασχολείται με την πόλη και τα αστικά μυθιστορήματα.",
      en: "Works on the city and urban fiction.",
      de: "Arbeitet über die Stadt und den Stadtroman.",
    },
  },
  {
    name: "Μαρίνα Ζέππου",
    initials: "ΜΖ",
    role: { el: "Κριτικός βιβλίου", en: "Book critic", de: "Buchkritikerin" },
    bio: {
      el: "Κριτικές πεζογραφίας και ποίησης.",
      en: "Reviews fiction and poetry.",
      de: "Kritiken zu Prosa und Lyrik.",
    },
  },
];

export type TimelineEntry = { year: string; text: Localized };

export const timeline: TimelineEntry[] = [
  {
    year: "2019",
    text: {
      el: "Η πρώτη συνάντηση, με εννέα αναγνώστες σε ένα σαλόνι.",
      en: "The first meeting, nine readers in a living room.",
      de: "Das erste Treffen, neun Lesende in einem Wohnzimmer.",
    },
  },
  {
    year: "2021",
    text: {
      el: "Κυκλοφορεί το πρώτο τεύχος σε ψηφιακή μορφή.",
      en: "The first issue appears in digital form.",
      de: "Die erste Ausgabe erscheint digital.",
    },
  },
  {
    year: "2023",
    text: {
      el: "Ξεκινά η στήλη μεταφράσεων με σημειώσεις.",
      en: "The translations section with notes begins.",
      de: "Die Rubrik Übersetzungen mit Anmerkungen startet.",
    },
  },
  {
    year: "2026",
    text: {
      el: "Έβδομο τεύχος και τρεις γλώσσες έκδοσης.",
      en: "Seventh issue, published in three languages.",
      de: "Siebte Ausgabe, in drei Sprachen.",
    },
  },
];

export const stats = [
  { value: "180", key: "members" as const },
  { value: "96", key: "meetings" as const },
  { value: "142", key: "essays" as const },
  { value: "7", key: "years" as const },
];

export const contactDetails = {
  email: "hello@moduslegendi.example",
  submissionsEmail: "texts@moduslegendi.example",
  phone: "+30 210 000 0000",
  address: {
    el: "Πραξιτέλους 24, Αθήνα 105 62",
    en: "24 Praxitelous St, Athens 105 62",
    de: "Praxitelous 24, 105 62 Athen",
  } satisfies Localized,
  social: [
    { label: "Instagram", handle: "@moduslegendi" },
    { label: "Mastodon", handle: "@moduslegendi@books.social" },
    { label: "Substack", handle: "moduslegendi" },
  ],
};

export function formatDate(date: string, locale: Locale) {
  const map: Record<Locale, string> = { el: "el-GR", en: "en-GB", de: "de-DE" };
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(map[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
