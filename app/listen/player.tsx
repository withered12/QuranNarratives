import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useAudio } from '@/context/AudioContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Verse {
    number: number;
    text: string;
    audio: string;
}

const PlayerScreen = () => {
    const { chapter_id, reciter_id, reciter_name } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const {
        loadAndPlayAudio,
        togglePlayPause,
        isPlaying,
        trackInfo,
        isMiniPlayerVisible
    } = useAudio();

    const [loading, setLoading] = useState(true);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [chapterInfo, setChapterInfo] = useState<any>(null);
    const [currentChapterId, setCurrentChapterId] = useState<string>(chapter_id as string);

    const flatListRef = useRef<FlatList>(null);
    const isFirstLoad = useRef(true);

    const loadChapterData = async (chapterId: string, autoPlay: boolean = true) => {
        try {
            const reciterIdentifier = (reciter_id as string) || '7';

            // Fetch verse text and audio from Quran.com API
            const [versesRes, audioRes, chapterRes] = await Promise.all([
                fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${chapterId}`).catch(() => ({ ok: false })),
                fetch(`https://api.quran.com/api/v4/recitations/${reciterIdentifier}/by_chapter/${chapterId}`).catch(() => ({ ok: false })),
                fetch(`https://api.quran.com/api/v4/chapters/${chapterId}?language=en`).catch(() => ({ ok: false }))
            ]);

            if (!versesRes.ok || !audioRes.ok || !chapterRes.ok) {
                console.error('[Player] One or more API requests failed');
                return null;
            }

            const versesData = await (versesRes as Response).json();
            const audioData = await (audioRes as Response).json();
            const chapterData = await (chapterRes as Response).json();

            // Build audio URL map keyed by verse_key
            const audioMap: Record<string, string> = {};
            for (const af of audioData.audio_files) {
                let url = af.url;
                if (!url.startsWith('http')) {
                    url = url.startsWith('//') ? `https:${url}` : `https://verses.quran.com/${url}`;
                }
                audioMap[af.verse_key] = url;
            }

            const combined = versesData.verses.map((v: any, index: number) => ({
                number: index + 1,
                text: v.text_uthmani,
                audio: audioMap[v.verse_key] || ''
            }));

            setVerses(combined);
            setChapterInfo(chapterData.chapter);
            setCurrentChapterId(chapterId);
            setCurrentVerseIndex(0);

            if (autoPlay && combined.length > 0) {
                playVerse(0, combined, chapterData.chapter, chapterId);
            }

            return { verses: combined, chapterInfo: chapterData.chapter };
        } catch (error) {
            console.error('[Player] Error loading chapter data:', error);
            return null;
        }
    };

    useEffect(() => {
        const loadInitialData = async () => {
            const chapterId = chapter_id as string;

            // If this surah is already playing, sync the index
            if (trackInfo && trackInfo.surahId === chapterId) {
                await loadChapterData(chapterId, false);
                setCurrentVerseIndex(trackInfo.verseNumber - 1);
            } else if (isFirstLoad.current) {
                await loadChapterData(chapterId, true);
            } else {
                await loadChapterData(chapterId, true);
            }

            setLoading(false);
            isFirstLoad.current = false;
        };

        loadInitialData();
    }, [chapter_id, reciter_id]);

    // Handle auto-scroll when verse changes
    useEffect(() => {
        if (verses.length > 0 && currentVerseIndex < verses.length && flatListRef.current) {
            try {
                flatListRef.current.scrollToIndex({
                    index: currentVerseIndex,
                    animated: true,
                    viewPosition: 0.3
                });
            } catch (error) {
                console.warn('[Player] Scroll error:', error);
            }
        }
    }, [currentVerseIndex, verses.length]);

    // Sync currentVerseIndex if audio finishes and advances in context
    useEffect(() => {
        if (trackInfo && trackInfo.surahId === chapter_id) {
            const index = trackInfo.verseNumber - 1;
            if (index !== currentVerseIndex && index < verses.length) {
                setCurrentVerseIndex(index);
            }
        }
    }, [trackInfo]);

    const playVerse = async (index: number, currentVerses: Verse[] = verses, info = chapterInfo, chapterId: string = currentChapterId) => {
        if (index >= currentVerses.length) {
            return;
        }

        try {
            const verse = currentVerses[index];
            if (!verse?.audio) {
                console.warn(`[Player] No audio found for verse ${index + 1}, skipping...`);
                if (index + 1 < currentVerses.length) {
                    playVerse(index + 1, currentVerses, info, chapterId);
                } else {
                    // Last verse had no audio, advance to next surah
                    const nextId = parseInt(chapterId) + 1;
                    if (nextId <= 114) {
                        console.log(`[Player] Auto-advancing to Surah ${nextId}`);
                        setLoading(true);
                        loadChapterData(String(nextId), true).then(() => setLoading(false));
                    }
                }
                return;
            }

            console.log(`[Player] Playing verse ${index + 1}: ${verse.audio}`);

            const reciterName = (reciter_name as string) || 'Reciter';
            const surahName = info?.name_arabic || 'Surah';

            await loadAndPlayAudio(
                {
                    surahName,
                    verseNumber: verse.number,
                    reciterName,
                    surahId: chapterId
                },
                verse.audio,
                () => {
                    // Callback when current verse finishes
                    const nextIndex = index + 1;
                    if (nextIndex < currentVerses.length) {
                        playVerse(nextIndex, currentVerses, info, chapterId);
                    } else {
                        // Last verse finished — advance to next surah
                        const nextId = parseInt(chapterId) + 1;
                        if (nextId <= 114) {
                            console.log(`[Player] Auto-advancing to Surah ${nextId}`);
                            setLoading(true);
                            loadChapterData(String(nextId), true).then(() => setLoading(false));
                        } else {
                            console.log('[Player] Reached the end of the Quran');
                        }
                    }
                }
            );

            setCurrentVerseIndex(index);

        } catch (error) {
            console.error('[Player] Error playing verse:', error);
        }
    };

    const togglePlayback = async () => {
        await togglePlayPause();
    };

    const skipToNext = () => {
        if (currentVerseIndex < verses.length - 1) {
            playVerse(currentVerseIndex + 1);
        } else {
            // On the last verse, skip to next surah
            const nextId = parseInt(currentChapterId) + 1;
            if (nextId <= 114) {
                console.log(`[Player] Skipping to Surah ${nextId}`);
                setLoading(true);
                loadChapterData(String(nextId), true).then(() => setLoading(false));
            }
        }
    };

    const skipToPrevious = () => {
        if (currentVerseIndex > 0) {
            playVerse(currentVerseIndex - 1);
        }
    };

    const renderVerseItem = ({ item, index }: { item: Verse; index: number }) => {
        const isActive = index === currentVerseIndex;

        return (
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => playVerse(index)}
                style={[
                    styles.verseItem,
                    isActive && styles.activeVerseItem
                ]}
            >
                <Text style={[
                    styles.verseTextAr,
                    isActive && styles.activeVerseTextAr
                ]}>
                    {item.text || '...'}
                </Text>
                <View style={[
                    styles.verseSeparator,
                    isActive && styles.activeVerseSeparator
                ]} />
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <BackgroundPattern>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#bf9540" />
                </View>
            </BackgroundPattern>
        );
    }

    return (
        <View style={styles.container}>
            <BackgroundPattern>
                <LinearGradient
                    colors={['transparent', 'rgba(10, 12, 20, 0.8)', '#0a0c14']}
                    style={styles.gradientOverlay}
                />

                <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                            <MaterialCommunityIcons name="chevron-down" size={32} color="#bf9540" />
                        </TouchableOpacity>
                        <View style={styles.titleContainer}>
                            <Text style={styles.nowPlayingText}>جاري الاستماع الآن</Text>
                            <Text style={styles.surahTitle}>{chapterInfo?.name_arabic}</Text>
                            {reciter_name ? <Text style={styles.reciterNameText}>{reciter_name}</Text> : null}
                        </View>
                        <View style={{ width: 40 }} />
                    </View>

                    <FlatList
                        ref={flatListRef}
                        data={verses}
                        renderItem={renderVerseItem}
                        keyExtractor={(item) => `verse-${item.number}`}
                        contentContainerStyle={styles.versesListContent}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        onScrollToIndexFailed={(info) => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                            });
                        }}
                    />

                    <View style={[styles.controlsFooter, { paddingBottom: insets.bottom + 40 }]}>
                        <View style={styles.surahProgressInfo}>
                            <Text style={styles.progressText}>الآية {currentVerseIndex + 1} من {verses.length}</Text>
                        </View>

                        <View style={styles.buttonsRow}>
                            <TouchableOpacity onPress={skipToNext} style={styles.navButton}>
                                <MaterialCommunityIcons name="skip-next" size={36} color={currentVerseIndex < verses.length - 1 ? "#bf9540" : "rgba(191, 149, 64, 0.2)"} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
                                <LinearGradient
                                    colors={['#e5c17d', '#bf9540', '#8c6a26']}
                                    style={styles.playButtonGradient}
                                >
                                    <MaterialCommunityIcons
                                        name={isPlaying ? "pause" : "play"}
                                        size={40}
                                        color="#0a0c14"
                                    />
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={skipToPrevious} style={styles.navButton}>
                                <MaterialCommunityIcons name="skip-previous" size={36} color={currentVerseIndex > 0 ? "#bf9540" : "rgba(191, 149, 64, 0.2)"} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BackgroundPattern>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0c14',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
    },
    nowPlayingText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 12,
        color: 'rgba(191, 149, 64, 0.6)',
        letterSpacing: 1,
    },
    surahTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 18,
        color: '#bf9540',
        marginTop: 4,
    },
    reciterNameText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 14,
        color: 'rgba(191, 149, 64, 0.6)',
        marginTop: 2,
    },
    versesListContent: {
        paddingHorizontal: 30,
        paddingBottom: 20,
    },
    verseItem: {
        marginVertical: 15,
        alignItems: 'center',
        padding: 20,
        borderRadius: 15,
        backgroundColor: 'transparent',
    },
    activeVerseItem: {
        backgroundColor: 'rgba(191, 149, 64, 0.05)',
        borderColor: 'rgba(191, 149, 64, 0.2)',
        borderWidth: 1,
    },
    verseTextAr: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 26,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 48,
    },
    activeVerseTextAr: {
        color: '#ffffff',
        fontSize: 30,
    },
    verseSeparator: {
        width: 40,
        height: 1,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        marginTop: 20,
    },
    activeVerseSeparator: {
        backgroundColor: '#bf9540',
        width: 80,
    },
    controlsFooter: {
        paddingHorizontal: 30,
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(191, 149, 64, 0.1)',
        paddingTop: 10,
    },
    surahProgressInfo: {
        alignItems: 'center',
        marginTop: 10,
    },
    progressText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 14,
        color: '#bf9540',
    },
    buttonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: 15,
        marginBottom: 10,
    },
    navButton: {
        padding: 10,
    },
    playButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        elevation: 10,
        shadowColor: '#bf9540',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    playButtonGradient: {
        width: '100%',
        height: '100%',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PlayerScreen;
