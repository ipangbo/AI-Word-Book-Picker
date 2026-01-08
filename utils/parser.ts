
import { SubtitleLine } from '../types';

// Helper to identify if text contains Chinese characters
const hasChinese = (text: string): boolean => {
  return /[\u4e00-\u9fa5]/.test(text);
};

// Helper to strip ASS formatting tags like {\an8} or {\c&HFFFFFF&}
const stripTags = (text: string): string => {
  return text.replace(/{[^}]+}/g, '');
};

export const parseAssSubtitle = (content: string): SubtitleLine[] => {
  const lines = content.split(/\r?\n/);
  const subtitles: SubtitleLine[] = [];
  let index = 0;
  let inEvents = false;
  
  // Standard V4+ format default fallback
  let formatFields = ["Layer", "Start", "End", "Style", "Name", "MarginL", "MarginR", "MarginV", "Effect", "Text"];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Section detection
    if (trimmed.startsWith('[')) {
        if (trimmed === '[Events]') {
            inEvents = true;
        } else if (trimmed.startsWith('[') && trimmed !== '[Events]') {
            inEvents = false;
        }
        continue;
    }

    if (!inEvents) continue;

    // Parse Format line (e.g. "Format: Layer, Start, End...")
    if (trimmed.startsWith('Format:')) {
        const content = trimmed.substring(7).trim(); // Remove "Format:"
        formatFields = content.split(',').map(f => f.trim());
        continue;
    }

    // Parse Dialogue lines
    if (trimmed.startsWith('Dialogue:')) {
      const firstColon = trimmed.indexOf(':');
      if (firstColon === -1) continue;
      
      const contentBody = trimmed.substring(firstColon + 1).trim();
      
      // Dynamic Field Lookup
      const textIndex = formatFields.indexOf('Text');
      const startIndex = formatFields.indexOf('Start');
      const endIndex = formatFields.indexOf('End');

      if (textIndex === -1 || startIndex === -1 || endIndex === -1) {
          // If format is missing critical fields, skip or fallback to assumption? 
          // Usually mandatory. Skip to be safe.
          continue;
      }

      // The "Text" field is always last. We need to find the Nth comma to separate metadata from text.
      // N = textIndex.
      let currentComma = 0;
      let splitIndex = -1;

      for (let i = 0; i < contentBody.length; i++) {
          if (contentBody[i] === ',') {
              currentComma++;
              if (currentComma === textIndex) {
                  splitIndex = i;
                  break;
              }
          }
      }

      if (splitIndex === -1) continue; // Malformed line

      const metaPart = contentBody.substring(0, splitIndex);
      const textPart = contentBody.substring(splitIndex + 1); // The rest is text

      const metaValues = metaPart.split(',');
      
      const start = metaValues[startIndex]?.trim() || "0:00:00.00";
      const end = metaValues[endIndex]?.trim() || "0:00:00.00";

      // --- Process Text for English/Chinese Separation ---
      
      // Handle \N for newlines (case insensitive)
      const splitParts = textPart.split(/\\N/i);

      let englishText = '';
      let chineseText = '';

      if (splitParts.length > 1) {
        // Clean and analyze each part
        const partsAnalysis = splitParts.map(p => {
             const clean = stripTags(p).trim();
             return {
                 raw: p,
                 clean,
                 hasChi: hasChinese(clean),
                 hasEng: /[a-zA-Z]{2,}/.test(clean) // Simple heuristic for English content
             };
        });

        const chineseParts = partsAnalysis.filter(p => p.hasChi);
        const englishParts = partsAnalysis.filter(p => !p.hasChi); // Assume non-Chinese is English/Target

        if (chineseParts.length > 0 && englishParts.length > 0) {
            // Clear separation
            chineseText = chineseParts.map(p => p.clean).join(' ');
            englishText = englishParts.map(p => p.clean).join(' ');
        } else if (englishParts.length === 0) {
            // All parts have Chinese characters.
            // It might be mixed text like "你好 Hello".
            // We will put it in Chinese text, but if it has English letters, we also put it in English text
            // so the user can click the words.
            chineseText = partsAnalysis.map(p => p.clean).join(' ');
            if (partsAnalysis.some(p => p.hasEng)) {
                 englishText = partsAnalysis.map(p => p.clean).join(' ');
            }
        } else {
            // All parts are English (no Chinese detected)
            englishText = partsAnalysis.map(p => p.clean).join(' ');
        }
      } else {
        // Single line
        const clean = stripTags(textPart).trim();
        const isChi = hasChinese(clean);
        const isEng = /[a-zA-Z]{2,}/.test(clean);

        if (isChi) {
            chineseText = clean;
            // If it also contains substantial English, treat as mixed and allow word selection
            if (isEng) {
                englishText = clean;
            }
        } else {
            // Assume English/Target if no Chinese
            englishText = clean;
        }
      }

      // Only add if we have English text to learn from
      if (englishText) {
        subtitles.push({
          id: `sub-${index++}`,
          startTime: start,
          endTime: end,
          englishText,
          chineseText
        });
      }
    }
  }

  return subtitles;
};
