import { getStoryDetails, getStoryVerses } from '@/services/quranApi';
import { fetchAndMergeNarrative } from '@/services/TafsirService';
import { Ayah } from '@/types';
import { MaterialCommunityIcons } from '@expo-vector-icons/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function Reader() {
    const { storyId, surahId } = useLocalSearchParams();
    const router = useRouter();

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTafsir, setShowTafsir] = useState(false);
    const [tafsirData, setTafsirData] = useState<string[]>([]);
    const [loadingTafsir, setLoadingTafsir] = useState(false);

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
    }, [story, surahIdStr]);

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
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#bf9540" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerSubtitle}>CURRENTLY READING</Text>
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
                        ayahs.map((ayah, index) => (
                            <View key={ayah.number} style={styles.verseBlock}>
                                <Text style={styles.arabicText}>{ayah.text}</Text>
                                {/* We don't have English text in the API result here, but we can simulate/placeholder */}
                                <Text style={styles.translationText}>
                                    "The narrative revealed in this verse carries profound wisdom for the believers."
                                </Text>

                                {index < ayahs.length - 1 && (
                                    <View style={styles.divider}>
                                        <View style={styles.dividerLine} />
                                        <MaterialCommunityIcons name="auto-fix" size={12} color="rgba(191, 149, 64, 0.3)" />
                                        <View style={styles.dividerLine} />
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </View>

                {showTafsir && (
                    <View style={styles.tafsirContainer}>
                        <LinearGradient
                            colors={['rgba(191, 149, 64, 0.1)', 'transparent']}
                            style={styles.tafsirGradient}
                        />
                        <Text style={styles.tafsirTitle}>SCHOLARLY INSIGHT</Text>
                        {loadingTafsir ? (
                            <ActivityIndicator color="#bf9540" />
                        ) : (
                            tafsirData.map((para, i) => (
                                <Text key={i} style={styles.tafsirText}>{para.replace(/<[^>]*>?/gm, '')}</Text>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>

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
                            <Text style={styles.fabText}>TAFSIR & STORY</Text>
                        </View>
                        <View style={styles.fabDivider} />
                        <MaterialCommunityIcons name="chevron-right" size={20} color="#0a0c14" />
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
        left: 0,
        right: 0,
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
        marginTop: 20,
        lineHeight: 26,
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
        left: 0,
        right: 0,
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
        left: 0,
        right: 0,
        height: 120,
        zIndex: 90,
    },
    tafsirContainer: {
        marginTop: 40,
        padding: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 32,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.1)',
    },
    tafsirGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        borderRadius: 32,
    },
    tafsirTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 12,
        color: '#bf9540',
        letterSpacing: 2,
        marginBottom: 20,
        textAlign: 'center',
    },
    tafsirText: {
        fontFamily: 'Newsreader_400Regular',
        fontSize: 16,
        color: 'rgba(245, 245, 220, 0.8)',
        lineHeight: 28,
        marginBottom: 16,
    }
});
