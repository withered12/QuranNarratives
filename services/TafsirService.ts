export interface TafsirItem {
    resource_id: number;
    text: string;
}

export interface TafsirResponse {
    tafsir: TafsirItem;
}

const TAFSIR_CACHE: Record<string, string[]> = {};

export const fetchAndMergeNarrative = async (
    surahId: number,
    startAyah: number,
    endAyah: number,
    resourceId: number = 14
): Promise<string[]> => {
    const cacheKey = `${surahId}_${startAyah}_${endAyah}_${resourceId}`;

    if (TAFSIR_CACHE[cacheKey]) {
        return TAFSIR_CACHE[cacheKey];
    }

    const narratives: string[] = [];
    let lastText = "";

    try {
        // We fetch tafsir for each ayah in the range
        // The Quran.com API v4 typically returns one tafsir object per request for a specific verse_key
        for (let ayah = startAyah; ayah <= endAyah; ayah++) {
            const verseKey = `${surahId}:${ayah}`;
            const url = `https://api.quran.com/api/v4/tafsirs/${resourceId}/by_ayah/${verseKey}`;
            console.log(`Fetching Tafsir: ${url}`);

            const response = await fetch(url);
            const data: TafsirResponse = await response.json();

            if (data.tafsir && data.tafsir.text) {
                console.log(`Successfully fetched Tafsir for ${verseKey}`);
                const currentText = data.tafsir.text.trim();

                // Deduplication logic: If the text is identical to the previous one, don't add it again
                // This is common in Ibn Kathir where one block spans multiple verses
                if (currentText !== lastText) {
                    narratives.push(currentText);
                    lastText = currentText;
                }
            }
        }

        TAFSIR_CACHE[cacheKey] = narratives;
        return narratives;
    } catch (error) {
        console.error("Error fetching tafsir:", error);
        return ["Failed to load story context. Please check your internet connection."];
    }
};
