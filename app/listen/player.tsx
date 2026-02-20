import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import AudioService from '@/services/AudioService';
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

// reciter_id is now the Al-Quran Cloud identifier directly (e.g. 'ar.alafasy')

const PlayerScreen = () => {
    const { chapter_id, reciter_id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [verses, setVerses] = useState<Verse[]>([]);
    const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [chapterInfo, setChapterInfo] = useState<any>(null);

    const flatListRef = useRef<FlatList>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const isPlayingRef = useRef(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const reciterIdentifier = (reciter_id as string) || 'ar.alafasy';

                const [versesRes, chapterRes] = await Promise.all([
                    fetch(`https://api.alquran.cloud/v1/surah/${chapter_id}/${reciterIdentifier}`).catch(() => ({ ok: false })),
                    fetch(`https://api.quran.com/api/v4/chapters/${chapter_id}?language=en`).catch(() => ({ ok: false }))
                ]);

                if (!versesRes.ok || !chapterRes.ok) {
                    console.error('[Player] One or more API requests failed');
                    return;
                }

                const versesData = await (versesRes as Response).json();
                const chapterData = await (chapterRes as Response).json();

                const combined = versesData.data.ayahs.map((a: any) => ({
                    number: a.numberInSurah,
                    text: a.text,
                    audio: a.audio
                }));

                setVerses(combined);
                setChapterInfo(chapterData.chapter);
                setLoading(false);

                // Start playing the first verse if it exists
                if (combined.length > 0) {
                    playVerse(0, combined);
                }

            } catch (error) {
                console.error('[Player] Error loading data:', error);
                setLoading(false);
            }
        };

        loadInitialData();

        return () => {
            AudioService.stopCurrentSound();
        };
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

    const playVerse = async (index: number, currentVerses: Verse[] = verses) => {
        if (index >= currentVerses.length) {
            setIsPlaying(false);
            isPlayingRef.current = false;
            return;
        }

        try {
            const verseAudio = currentVerses[index]?.audio;
            if (!verseAudio) {
                console.warn(`[Player] No audio found for verse ${index + 1}, skipping...`);
                if (index + 1 < currentVerses.length) {
                    playVerse(index + 1, currentVerses);
                }
                return;
            }

            console.log(`[Player] Playing verse ${index + 1}: ${verseAudio}`);

            await AudioService.playNewSound(verseAudio, (status: any) => {
                if (status.didJustFinish) {
                    setCurrentVerseIndex(prev => {
                        const next = prev + 1;
                        playVerse(next, currentVerses);
                        return next;
                    });
                }
            });

            const newSound = AudioService.getSound();
            soundRef.current = newSound;
            setSound(newSound);
            setIsPlaying(true);
            isPlayingRef.current = true;
            setCurrentVerseIndex(index);

        } catch (error) {
            console.error('[Player] Error playing verse:', error);
        }
    };

    const togglePlayback = async () => {
        if (!soundRef.current) return;

        if (isPlaying) {
            await AudioService.stopCurrentSound();
            setIsPlaying(false);
            isPlayingRef.current = false;
        } else {
            // Restart current verse if no sound exists
            playVerse(currentVerseIndex);
        }
    };

    const skipToNext = () => {
        if (currentVerseIndex < verses.length - 1) {
            playVerse(currentVerseIndex + 1);
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
                            <Text style={styles.surahTitle}>{chapterInfo?.name_simple} - {chapterInfo?.name_arabic}</Text>
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
                            <TouchableOpacity onPress={skipToPrevious} style={styles.navButton}>
                                <MaterialCommunityIcons name="skip-previous" size={36} color={currentVerseIndex > 0 ? "#bf9540" : "rgba(191, 149, 64, 0.2)"} />
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

                            <TouchableOpacity onPress={skipToNext} style={styles.navButton}>
                                <MaterialCommunityIcons name="skip-next" size={36} color={currentVerseIndex < verses.length - 1 ? "#bf9540" : "rgba(191, 149, 64, 0.2)"} />
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
