
// Utilities for word normalization and morphology checking

// Comprehensive map of common irregular verbs to their base form
const IRREGULAR_VERBS: Record<string, string> = {
  "arisen": "arise", "arose": "arise",
  "ate": "eat", "eaten": "eat",
  "awoke": "awake", "awoken": "awake",
  "bad": "bad", 
  "be": "be", "am": "be", "is": "be", "are": "be", "was": "be", "were": "be", "been": "be",
  "beat": "beat", "beaten": "beat",
  "became": "become", "become": "become",
  "began": "begin", "begun": "begin",
  "bent": "bend",
  "bet": "bet",
  "bid": "bid",
  "bit": "bite", "bitten": "bite",
  "blew": "blow", "blown": "blow",
  "bought": "buy",
  "broke": "break", "broken": "break",
  "brought": "bring",
  "built": "build",
  "burnt": "burn", "burned": "burn",
  "caught": "catch",
  "chose": "choose", "chosen": "choose",
  "came": "come",
  "cost": "cost",
  "cut": "cut",
  "dealt": "deal",
  "did": "do", "done": "do", "does": "do",
  "drew": "draw", "drawn": "draw",
  "drank": "drink", "drunk": "drink",
  "drove": "drive", "driven": "drive",
  "dug": "dig",
  "fell": "fall", "fallen": "fall",
  "fed": "feed",
  "felt": "feel",
  "fought": "fight",
  "found": "find",
  "flew": "fly", "flown": "fly",
  "forgot": "forget", "forgotten": "forget",
  "forgave": "forgive", "forgiven": "forgive",
  "froze": "freeze", "frozen": "freeze",
  "got": "get", "gotten": "get",
  "gave": "give", "given": "give",
  "went": "go", "gone": "go",
  "grew": "grow", "grown": "grow",
  "hung": "hang",
  "had": "have", "has": "have",
  "heard": "hear",
  "hid": "hide", "hidden": "hide",
  "hit": "hit",
  "held": "hold",
  "hurt": "hurt",
  "kept": "keep",
  "knew": "know", "known": "know",
  "laid": "lay",
  "led": "lead",
  "left": "leave",
  "lent": "lend",
  "let": "let",
  "lay": "lie", "lain": "lie",
  "lit": "light",
  "lost": "lose",
  "made": "make",
  "meant": "mean",
  "met": "meet",
  "paid": "pay",
  "put": "put",
  "read": "read",
  "rode": "ride", "ridden": "ride",
  "rang": "ring", "rung": "ring",
  "rose": "rise", "risen": "rise",
  "ran": "run",
  "said": "say",
  "saw": "see", "seen": "see",
  "sold": "sell",
  "sent": "send",
  "set": "set",
  "shook": "shake", "shaken": "shake",
  "shone": "shine",
  "shot": "shoot",
  "showed": "show", "shown": "show",
  "shut": "shut",
  "sang": "sing", "sung": "sing",
  "sank": "sink", "sunk": "sink",
  "sat": "sit",
  "slept": "sleep",
  "spoke": "speak", "spoken": "speak",
  "spent": "spend",
  "stood": "stand",
  "stole": "steal", "stolen": "steal",
  "stuck": "stick",
  "struck": "strike",
  "swore": "swear", "sworn": "swear",
  "swept": "sweep",
  "swam": "swim", "swum": "swim",
  "took": "take", "taken": "take",
  "taught": "teach",
  "tore": "tear", "torn": "tear",
  "told": "tell",
  "thought": "think",
  "threw": "throw", "thrown": "throw",
  "understood": "understand",
  "woke": "wake", "woken": "wake",
  "wore": "wear", "worn": "wear",
  "won": "win",
  "wrote": "write", "written": "write",
  "would": "will",
  "could": "can",
  "should": "shall",
  "might": "may"
};

// Irregular contractions that can't be handled by simple stripping
const IRREGULAR_CONTRACTIONS: Record<string, string> = {
    "won't": "will",
    "can't": "can",
    "shan't": "shall",
    "ain't": "be" // or have, but usually implies being or having. 'be' is a safe fallback for high frequency.
};

// Clean word: lowercase, normalize quotes, remove surrounding punctuation
export const cleanWord = (text: string): string => {
    let cleaned = text.toLowerCase();
    // Normalize smart quotes (right single quotation mark, left single, etc) to standard apostrophe
    cleaned = cleaned.replace(/[\u2018\u2019\u201B]/g, "'");
    cleaned = cleaned.replace(/[^a-z']/g, '');
    // Remove leading/trailing apostrophes (e.g. 'cause -> cause, james' -> james)
    cleaned = cleaned.replace(/^'+|'+$/g, '');
    return cleaned;
};

export const isWordKnown = (rawWord: string, knownSet: Set<string>): boolean => {
    const word = cleanWord(rawWord);
    if (!word) return true; 

    // Helper: Recursively check if a word or its irregular base is known
    // This ensures 'did' checks 'did' (in case user added it) AND 'do' (irregular base)
    const checkBase = (candidate: string): boolean => {
        if (knownSet.has(candidate)) return true;
        if (IRREGULAR_VERBS[candidate] && knownSet.has(IRREGULAR_VERBS[candidate])) return true;
        return false;
    };

    // 1. Direct Match
    if (checkBase(word)) return true;

    // 2. Contraction Handling
    if (word.includes("'")) {
        // Check explicit irregular contractions first
        if (IRREGULAR_CONTRACTIONS[word]) {
            if (checkBase(IRREGULAR_CONTRACTIONS[word])) return true;
        }

        // Standard contractions stripping
        // Handle "n't" (not) - e.g., didn't -> did, mustn't -> must
        if (word.endsWith("n't")) {
            const stem = word.slice(0, -3);
            if (checkBase(stem)) return true;
        }
        
        // Handle other standard suffixes ('ve, 're, 'll, 'd, 'm, 's)
        // We iterate to find the match
        const suffixes = ["'ve", "'re", "'ll", "'d", "'m", "'s"];
        for (const suffix of suffixes) {
            if (word.endsWith(suffix)) {
                const stem = word.slice(0, -suffix.length);
                if (checkBase(stem)) return true;
            }
        }
    }

    // 3. Regular Morphology (Suffix Stripping)
    // We allow recursive stripping (e.g. lovingly -> loving -> love) but usually 1 level is enough for basic checklist.
    
    // Plurals / Third person (-s, -es, -ies)
    if (word.endsWith('s')) {
        if (word.endsWith('ies')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; // parties -> party
        }
        if (word.endsWith('es')) {
             if (checkBase(word.slice(0, -2))) return true; // buses -> bus, goes -> go
        }
        if (checkBase(word.slice(0, -1))) return true; // cats -> cat
    }

    // Past tense (-d, -ed, -ied)
    if (word.endsWith('ed')) {
        if (word.endsWith('ied')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; // cried -> cry
        }
        if (checkBase(word.slice(0, -2))) return true; // walked -> walk
        if (checkBase(word.slice(0, -1))) return true; // lived -> live
        
        // Double consonant: stopped -> stop
        const stem = word.slice(0, -2);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    // Progressive (-ing)
    if (word.endsWith('ing')) {
        if (checkBase(word.slice(0, -3))) return true; // walking -> walk
        if (checkBase(word.slice(0, -3) + 'e')) return true; // making -> make
        
        // Double consonant: running -> run
        const stem = word.slice(0, -3);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    // Adverbs (-ly)
    if (word.endsWith('ly')) {
        if (checkBase(word.slice(0, -2))) return true; // quickly -> quick
        if (word.endsWith('ily')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; // happily -> happy
        }
    }

    // Comparative / Superlative (-er, -est)
    if (word.endsWith('er')) {
        if (checkBase(word.slice(0, -2))) return true; // faster -> fast
        if (checkBase(word.slice(0, -2) + 'e')) return true; // larger -> large
        // big -> bigger
        const stem = word.slice(0, -2);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }
    if (word.endsWith('est')) {
        if (checkBase(word.slice(0, -3))) return true; // fastest -> fast
        if (checkBase(word.slice(0, -3) + 'e')) return true; // largest -> large
        // big -> biggest
        const stem = word.slice(0, -3);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    return false;
};
