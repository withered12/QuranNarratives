import { getStoryDetails, getStoryVerses } from '@/services/quranApi';
import { fetchAndMergeNarrative } from '@/services/TafsirService';
import { Ayah } from '@/types';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Reader() {
    const { storyId, surahId } = useLocalSearchParams();
    const router = useRouter();

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTafsir, setShowTafsir] = useState(false);
    const [tafsirData, setTafsirData] = useState<string[]>([]);
    const [loadingTafsir, setLoadingTafsir] = useState(false);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playingAyahKey, setPlayingAyahKey] = useState<string | null>(null);
    const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

    const sId = Array.isArray(storyId) ? storyId[0] : storyId;
    const surahIdStr = Array.isArray(surahId) ? surahId[0] : surahId;

    const story = getStoryDetails(surahIdStr || '', sId || '');

    useEffect(() => {
        async function loadData() {
            if (story && surahIdStr) {
                // @ts-ignore
                const data = await getStoryVerses(surahIdStr, story.start_ayah, story.end_ayah);
                setAyahs(data);
            }
            setLoading(false);
        }
        loadData();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [story, surahIdStr, sound]);

    const playAudio = async (ayahNumber: number) => {
        const ayahKey = `${surahIdStr}:${ayahNumber}`;

        try {
            // If already playing this verse, pause it
            if (playingAyahKey === ayahKey) {
                await pauseAudio();
                return;
            }

            setLoadingAudio(ayahKey);

            // Unload previous sound if any
            if (sound) {
                await sound.unloadAsync();
            }

            // Fetch audio URL from Quran.com API
            const response = await fetch(`https://api.quran.com/api/v4/recitations/7/by_ayah/${ayahKey}`);
            const data = await response.json();

            if (data.audio_files && data.audio_files.length > 0) {
                let audioUrl = data.audio_files[0].url;
                if (!audioUrl.startsWith('http')) {
                    if (audioUrl.startsWith('//')) {
                        audioUrl = `https:${audioUrl}`;
                    } else {
                        audioUrl = `https://verses.quran.com/${audioUrl}`;
                    }
                }

                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: true }
                );

                setSound(newSound);
                setPlayingAyahKey(ayahKey);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setPlayingAyahKey(null);
                    }
                });
            }
        } catch (error) {
            console.error("Error playing audio:", error);
        } finally {
            setLoadingAudio(null);
        }
    };

    const pauseAudio = async () => {
        if (sound) {
            await sound.pauseAsync();
            setPlayingAyahKey(null);
        }
    };

    const loadTafsir = async () => {
        if (!story || !surahIdStr) return;
        setLoadingTafsir(true);
        setShowTafsir(true);
        try {
            const data = await fetchAndMergeNarrative(
                parseInt(surahIdStr),
                story.start_ayah,
                story.end_ayah,
                story.preferred_tafsir_source || 14
            );
            setTafsirData(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTafsir(false);
        }
    };

    if (!story) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Top Bar */}
            <BlurView intensity={80} tint="dark" style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
                            style={styles.backButton}
                        >
                            <MaterialCommunityIcons name="arrow-right" size={24} color="#bf9540" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerSubtitle}>أنت تقرأ الآن</Text>
                            <Text style={styles.headerTitle} numberOfLines={1}>{story.title_ar}</Text>
                        </View>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </BlurView>

            {/* Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '42%' }]} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.canvas}>
                    {loading ? (
                        <ActivityIndicator color="#bf9540" size="large" style={{ marginTop: 100 }} />
                    ) : (
                        ayahs.map((ayah, index) => {
                            const ayahKey = `${surahIdStr}:${ayah.number}`;
                            const isPlaying = playingAyahKey === ayahKey;
                            const isLoading = loadingAudio === ayahKey;

                            return (
                                <View key={ayah.number} style={styles.verseBlock}>
                                    <Text style={[styles.arabicText, isPlaying && styles.activeText]}>
                                        {ayah.text}
                                    </Text>

                                    <View style={styles.audioControls}>
                                        <TouchableOpacity
                                            onPress={() => playAudio(ayah.number)}
                                            style={[styles.audioButton, isPlaying && styles.activeAudioButton]}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator size="small" color="#bf9540" />
                                            ) : (
                                                <MaterialIcons
                                                    name={isPlaying ? "pause" : "play-arrow"}
                                                    size={24}
                                                    color={isPlaying ? "#0a0c14" : "#bf9540"}
                                                />
                                            )}
                                        </TouchableOpacity>
                                        <View style={styles.citationContainer}>
                                            <Text style={styles.citationText}>تلاوة الشيخ مشاري العفاسي</Text>
                                        </View>
                                    </View>


                                    {index < ayahs.length - 1 && (
                                        <View style={styles.divider}>
                                            <View style={styles.dividerLine} />
                                            <MaterialCommunityIcons name="auto-fix" size={12} color="rgba(191, 149, 64, 0.3)" />
                                            <View style={styles.dividerLine} />
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Tafsir Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showTafsir}
                onRequestClose={() => setShowTafsir(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                onPress={() => setShowTafsir(false)}
                                style={styles.closeButton}
                            >
                                <MaterialCommunityIcons name="close" size={24} color="#bf9540" />
                            </TouchableOpacity>
                            <Text style={styles.tafsirTitle}>التفسير والقصة</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView style={styles.tafsirScroll} contentContainerStyle={styles.tafsirContent}>
                            {loadingTafsir ? (
                                <ActivityIndicator color="#bf9540" size="large" style={{ marginTop: 40 }} />
                            ) : (
                                tafsirData.map((para, i) => (
                                    <Text key={i} style={styles.tafsirText}>{para.replace(/<[^>]*>?/gm, '')}</Text>
                                ))
                            )}
                        </ScrollView>
                    </BlurView>
                </View>
            </Modal>

            {/* Floating Action Button */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={loadTafsir}
                    style={styles.fabTouchable}
                >
                    <LinearGradient
                        colors={['#e5c17d', '#bf9540', '#8c6a26']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.fab}
                    >
                        <View style={styles.fabLeft}>
                            <MaterialCommunityIcons name="book-open-page-variant" size={20} color="#0a0c14" />
                            <Text style={styles.fabText}>التفسير والقصة</Text>
                        </View>
                        <View style={styles.fabDivider} />
                        <MaterialCommunityIcons name="chevron-left" size={20} color="#0a0c14" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Bottom Fade */}
            <LinearGradient
                colors={['transparent', 'rgba(10, 12, 20, 0.8)', '#0a0c14']}
                style={styles.bottomFade}
                pointerEvents="none"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0c14',
    },
    header: {
        position: 'absolute',
        top: 0,
        start: 0,
        end: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(191, 149, 64, 0.1)',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerSubtitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 8,
        letterSpacing: 2,
        color: 'rgba(191, 149, 64, 0.6)',
    },
    headerTitle: {
        fontFamily: 'Lato_700Bold',
        fontSize: 14,
        color: '#F5F5DC',
        marginTop: 2,
    },
    progressBarBackground: {
        height: 2,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        marginTop: 80, // Approximate header height + padding
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#bf9540',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 40,
        paddingBottom: 120,
    },
    canvas: {
        maxWidth: 600,
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
    verseBlock: {
        alignItems: 'center',
        marginBottom: 48,
    },
    arabicText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 32,
        lineHeight: 70,
        color: '#F5F5DC',
        textAlign: 'center',
    },
    translationText: {
        fontFamily: 'Newsreader_400Regular_Italic',
        fontSize: 18,
        color: 'rgba(191, 149, 64, 0.8)',
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 26,
        flex: 1,
    },
    audioControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 16,
        width: '100%',
        justifyContent: 'center',
    },
    audioButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    citationContainer: {
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
    },
    citationText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 12,
        color: '#bf9540',
        textAlign: 'right',
    },
    activeAudioButton: {
        backgroundColor: '#bf9540',
        borderColor: '#bf9540',
    },
    activeText: {
        color: '#bf9540',
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        width: '100%',
        marginTop: 32,
    },
    dividerLine: {
        height: 1,
        backgroundColor: 'rgba(191, 149, 64, 0.2)',
        width: 40,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 40,
        start: 0,
        end: 0,
        alignItems: 'center',
        zIndex: 100,
    },
    fabTouchable: {
        shadowColor: '#bf9540',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        minWidth: 220,
        justifyContent: 'space-between',
    },
    fabLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    fabText: {
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
        color: '#0a0c14',
        letterSpacing: 2,
    },
    fabDivider: {
        width: 1,
        height: 24,
        backgroundColor: 'rgba(10, 12, 20, 0.1)',
        marginHorizontal: 16,
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0,
        start: 0,
        end: 0,
        height: 120,
        zIndex: 90,
    },
    tafsirScroll: {
        flex: 1,
    },
    tafsirContent: {
        padding: 24,
        paddingBottom: 60,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBlur: {
        height: '85%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderTopWidth: 1,
        borderTopColor: 'rgba(191, 149, 64, 0.3)',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(191, 149, 64, 0.1)',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
    },
    tafsirTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 16,
        color: '#bf9540',
        letterSpacing: 2,
    },
    tafsirText: {
        fontFamily: 'Newsreader_400Regular',
        fontSize: 18,
        color: '#F5F5DC',
        lineHeight: 32,
        marginBottom: 24,
        textAlign: 'right',
        writingDirection: 'rtl',
    }
});
