
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
    "ain't": "be"
};

// Clean word: lowercase, normalize quotes, remove surrounding punctuation
export const cleanWord = (text: string): string => {
    let cleaned = text.toLowerCase();
    cleaned = cleaned.replace(/[\u2018\u2019\u201B]/g, "'");
    cleaned = cleaned.replace(/[^a-z']/g, '');
    cleaned = cleaned.replace(/^'+|'+$/g, '');
    return cleaned;
};

export const isWordKnown = (rawWord: string, knownSet: Set<string>): boolean => {
    const word = cleanWord(rawWord);
    if (!word) return true; 

    const checkBase = (candidate: string): boolean => {
        if (knownSet.has(candidate)) return true;
        if (IRREGULAR_VERBS[candidate] && knownSet.has(IRREGULAR_VERBS[candidate])) return true;
        return false;
    };

    if (checkBase(word)) return true;

    if (word.includes("'")) {
        if (IRREGULAR_CONTRACTIONS[word]) {
            if (checkBase(IRREGULAR_CONTRACTIONS[word])) return true;
        }

        if (word.endsWith("n't")) {
            const stem = word.slice(0, -3);
            if (checkBase(stem)) return true;
        }
        
        const suffixes = ["'ve", "'re", "'ll", "'d", "'m", "'s"];
        for (const suffix of suffixes) {
            if (word.endsWith(suffix)) {
                const stem = word.slice(0, -suffix.length);
                if (checkBase(stem)) return true;
            }
        }
    }

    if (word.endsWith('s')) {
        if (word.endsWith('ies')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; 
        }
        if (word.endsWith('es')) {
             if (checkBase(word.slice(0, -2))) return true; 
        }
        if (checkBase(word.slice(0, -1))) return true; 
    }

    if (word.endsWith('ed')) {
        if (word.endsWith('ied')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; 
        }
        if (checkBase(word.slice(0, -2))) return true; 
        if (checkBase(word.slice(0, -1))) return true; 
        
        const stem = word.slice(0, -2);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    if (word.endsWith('ing')) {
        if (checkBase(word.slice(0, -3))) return true; 
        if (checkBase(word.slice(0, -3) + 'e')) return true; 
        
        const stem = word.slice(0, -3);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    if (word.endsWith('ly')) {
        if (checkBase(word.slice(0, -2))) return true; 
        if (word.endsWith('ily')) {
             if (checkBase(word.slice(0, -3) + 'y')) return true; 
        }
    }

    if (word.endsWith('er')) {
        if (checkBase(word.slice(0, -2))) return true; 
        if (checkBase(word.slice(0, -2) + 'e')) return true; 
        const stem = word.slice(0, -2);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }
    if (word.endsWith('est')) {
        if (checkBase(word.slice(0, -3))) return true; 
        if (checkBase(word.slice(0, -3) + 'e')) return true; 
        const stem = word.slice(0, -3);
        if (stem.length > 2 && stem[stem.length-1] === stem[stem.length-2]) {
             if (checkBase(stem.slice(0, -1))) return true;
        }
    }

    return false;
};

// --- New Logic for Auto-Context ---

import { SubtitleLine } from "../types";

// Checks if a text string ends with a sentence terminator (. ? !), optionally followed by quote or space
const endsWithTerminator = (text: string): boolean => {
    return /[.?!]["']?\s*$/.test(text);
};

// Checks if text starts with a capital letter (simple heuristic for sentence start, though not perfect)
const startsWithCapital = (text: string): boolean => {
    return /^[A-Z]/.test(text.trim());
};

export const getExpandedContext = (
    currentIndex: number, 
    subtitles: SubtitleLine[], 
    maxDepth: number = 5
): { fullEnglish: string; fullChinese: string } => {
    if (currentIndex < 0 || currentIndex >= subtitles.length) {
        return { fullEnglish: "", fullChinese: "" };
    }

    let startIndex = currentIndex;
    let endIndex = currentIndex;

    // 1. Search Backwards
    // We move backwards as long as the *previous* line did NOT end with a terminator.
    // If the previous line ends with ".", it means the current block likely starts a new sentence.
    // Safety break: maxDepth
    let depth = 0;
    while (startIndex > 0 && depth < maxDepth) {
        const prevLine = subtitles[startIndex - 1];
        if (endsWithTerminator(prevLine.englishText)) {
            // Previous line ended a sentence. Stop here. current 'startIndex' is the start of new sentence.
            break;
        }
        // Also stop if current line looks like a very strong start (e.g. "Captain, look!") 
        // BUT subtitles often break midway, e.g. "I went" / "to the store". "to" is lowercase.
        // So checking lowercase is better. If current line starts with Uppercase, it MIGHT be a start,
        // but checking punctuation of previous line is safer for dialogue lists.
        
        startIndex--;
        depth++;
    }

    // 2. Search Forwards
    // We move forwards as long as the *current pointer* line does NOT end with a terminator.
    depth = 0;
    while (endIndex < subtitles.length - 1 && depth < maxDepth) {
        const currLine = subtitles[endIndex];
        if (endsWithTerminator(currLine.englishText)) {
            // Current line ends the sentence. Stop here.
            break;
        }
        endIndex++;
        depth++;
    }

    // 3. Construct the merged strings
    const englishParts: string[] = [];
    const chineseParts: string[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
        englishParts.push(subtitles[i].englishText.trim());
        // Chinese context usually matches 1:1 in valid .ass files, but sometimes empty.
        if (subtitles[i].chineseText) {
            chineseParts.push(subtitles[i].chineseText.trim());
        }
    }

    return {
        fullEnglish: englishParts.join(' '),
        fullChinese: chineseParts.join(' ')
    };
};
