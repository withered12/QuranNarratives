import quran2 from '../data/quran_2.json';
import quran3 from '../data/quran_3.json';
import quran5 from '../data/quran_5.json';
import quran7 from '../data/quran_7.json';
import quran11 from '../data/quran_11.json';
import quran12 from '../data/quran_12.json';
import quran18 from '../data/quran_18.json';
import quran19 from '../data/quran_19.json';
import quran20 from '../data/quran_20.json';
import quran21 from '../data/quran_21.json';
import quran27 from '../data/quran_27.json';
import quran31 from '../data/quran_31.json';
import quran34 from '../data/quran_34.json';
import quran105 from '../data/quran_105.json';
import { Ayah, StoryMap, Story } from '../types';
import storyMapData from '../data/story_map.json';

const STORY_MAP = storyMapData as StoryMap;
const LOCAL_QURAN_DATA: Record<string, any> = {
    '2': quran2,
    '3': quran3,
    '5': quran5,
    '7': quran7,
    '11': quran11,
    '12': quran12,
    '18': quran18,
    '19': quran19,
    '20': quran20,
    '21': quran21,
    '27': quran27,
    '31': quran31,
    '34': quran34,
    '105': quran105,
};

const SURAH_CACHE: Record<number, Ayah[]> = {};

export const getSurahList = () => {
    return Object.keys(STORY_MAP).map((key) => {
        const id = key.replace('surah_', '');
        return {
            id,
            ...STORY_MAP[key],
        };
    });
};

export const getSurahStories = (surahId: string) => {
    const key = `surah_${surahId}`;
    return STORY_MAP[key] || null;
};

export const getStoryDetails = (surahId: string, storyId: string) => {
    const surahData = getSurahStories(surahId);
    if (!surahData) return null;
    return surahData.stories.find(s => s.id === storyId);
};

export const getAllStories = (): (Story & { surahId: string })[] => {
    const allStories: (Story & { surahId: string })[] = [];
    Object.keys(STORY_MAP).forEach(key => {
        const surahId = key.replace('surah_', '');
        STORY_MAP[key].stories.forEach(story => {
            allStories.push({ ...story, surahId });
        });
    });
    return allStories;
};

const normalizeText = (text: string) => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, "") // Remove English diacritics
        .replace(/[\u064B-\u0652]/g, "") // Remove Arabic Tashkeel
        .replace(/[آأإ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .trim();
};

export const searchStories = (query: string) => {
    if (!query) return [];
    const q = normalizeText(query);

    return getAllStories().filter(s => {
        const title = normalizeText(s.title);
        const titleAr = normalizeText(s.title_ar);
        const summary = normalizeText(s.summary);
        const summaryAr = normalizeText(s.summary_ar);

        return title.includes(q) ||
            titleAr.includes(q) ||
            summary.includes(q) ||
            summaryAr.includes(q) ||
            (s.tags && s.tags.some(t => normalizeText(t).includes(q))) ||
            (s.tags_ar && s.tags_ar.some(t => normalizeText(t).includes(q))) ||
            (s.prophets && s.prophets.some(p => normalizeText(p).includes(q))) ||
            (s.prophets_ar && s.prophets_ar.some(p => normalizeText(p).includes(q)));
    });
};

export const getAllProphetsAr = () => {
    const prophets = new Set<string>();
    getAllStories().forEach(s => {
        s.prophets_ar?.forEach(p => prophets.add(p));
    });
    return Array.from(prophets);
};

export const getAllTagsAr = () => {
    const tags = new Set<string>();
    getAllStories().forEach(s => {
        s.tags_ar?.forEach(t => tags.add(t));
    });
    return Array.from(tags);
};

export const getChronologicalStories = () => {
    return getAllStories().sort((a, b) => (a.chronology_index || 999) - (b.chronology_index || 999));
};

async function fetchSurahFromApi(surahId: string): Promise<Ayah[]> {
    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.asad`);
        const result = await response.json();

        if (result.code !== 200) throw new Error('API Error');

        const arabicAyahs = result.data[0].ayahs;
        const englishAyahs = result.data[1].ayahs;

        return arabicAyahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: englishAyahs[index] ? englishAyahs[index].text : '',
        }));
    } catch (error) {
        console.error(`Failed to fetch Surah ${surahId}:`, error);
        return [];
    }
}

export const getStoryVerses = async (surahId: string, startAyah: number, endAyah: number): Promise<Ayah[]> => {
    const surahNum = parseInt(surahId);

    // 1. Check local cache (memory)
    if (SURAH_CACHE[surahNum]) {
        return SURAH_CACHE[surahNum].filter(a => a.number >= startAyah && a.number <= endAyah);
    }

    // 2. Check local data files
    const rawData = LOCAL_QURAN_DATA[surahId];
    if (rawData) {
        const arabicAyahs = rawData.data[0].ayahs;
        const englishAyahs = rawData.data[1].ayahs;

        const combined: Ayah[] = arabicAyahs.map((ayah: any, index: number) => ({
            number: ayah.numberInSurah,
            text: ayah.text,
            translation: englishAyahs[index] ? englishAyahs[index].text : '',
        }));

        SURAH_CACHE[surahNum] = combined;
        return combined.filter(a => a.number >= startAyah && a.number <= endAyah);
    }

    // 3. Dynamic Fetch from API
    console.log(`Surah ${surahId} not found locally, fetching from API...`);
    const fetchedAyahs = await fetchSurahFromApi(surahId);
    if (fetchedAyahs.length > 0) {
        SURAH_CACHE[surahNum] = fetchedAyahs;
        return fetchedAyahs.filter(a => a.number >= startAyah && a.number <= endAyah);
    }

    return [];
};
