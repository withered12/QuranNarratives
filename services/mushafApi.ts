import { MushafVerse } from '../types';

const MUSHAF_CACHE = new Map<number, MushafVerse[]>();

export const fetchMushafPage = async (pageNumber: number): Promise<MushafVerse[]> => {
    // 1. Check cache
    if (MUSHAF_CACHE.has(pageNumber)) {
        return MUSHAF_CACHE.get(pageNumber)!;
    }

    // 2. Fetch from API
    try {
        const response = await fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?page_number=${pageNumber}`);
        const data = await response.json();

        if (!data.verses) {
            throw new Error('Invalid API response');
        }

        const verses: MushafVerse[] = data.verses.map((v: any) => ({
            id: v.id,
            verseKey: v.verse_key,
            textUthmani: v.text_uthmani,
        }));

        // 3. Store in cache
        MUSHAF_CACHE.set(pageNumber, verses);
        return verses;
    } catch (error) {
        console.error(`Failed to fetch Mushaf page ${pageNumber}:`, error);
        throw error;
    }
};

export const prefetchMushafPage = async (pageNumber: number): Promise<void> => {
    if (pageNumber < 1 || pageNumber > 604 || MUSHAF_CACHE.has(pageNumber)) {
        return;
    }

    try {
        await fetchMushafPage(pageNumber);
        console.log(`Prefetched Mushaf page ${pageNumber}`);
    } catch (error) {
        // Silent fail for prefetch
    }
};
