export interface Story {
    id: string;
    title: string;
    title_ar: string;
    start_ayah: number;
    end_ayah: number;
    summary: string;
    summary_ar: string;
    tags?: string[];
    tags_ar?: string[];
    prophets?: string[];
    prophets_ar?: string[];
    category?: string;
    category_ar?: string;
    chronology_index?: number;
}

export interface SurahData {
    name: string;
    name_ar: string;
    stories: Story[];
}

export interface StoryMap {
    [key: string]: SurahData;
}

export interface Ayah {
    number: number;
    text: string;
    translation: string;
}
