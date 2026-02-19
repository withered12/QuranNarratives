import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Reciter {
    id: number;
    reciter_name: string;
    style?: string;
}

interface Chapter {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

const ListenScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [reciters, setReciters] = useState<Reciter[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [selectedReciterId, setSelectedReciterId] = useState<number>(7); // Default: Mishari Rashid al-Afasy
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [recitationsRes, chaptersRes] = await Promise.all([
                    fetch('https://api.quran.com/api/v4/resources/recitations?language=en').catch(() => ({ ok: false })),
                    fetch('https://api.quran.com/api/v4/chapters?language=en').catch(() => ({ ok: false }))
                ]);

                if (!recitationsRes.ok || !chaptersRes.ok) {
                    console.error('[Listen] One or more API requests failed');
                    return;
                }

                const recitationsData = await (recitationsRes as Response).json();
                const chaptersData = await (chaptersRes as Response).json();

                if (recitationsData?.recitations) setReciters(recitationsData.recitations);
                if (chaptersData?.chapters) setChapters(chaptersData.chapters);
            } catch (error) {
                console.error('[Listen] Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const renderSurahItem = ({ item, index }: { item: Chapter; index: number }) => (
        <Animated.View
            entering={FadeInDown.delay(index * 50).duration(600)}
            style={styles.surahCardContainer}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                    router.push({
                        pathname: '/listen/player',
                        params: {
                            chapter_id: item.id,
                            reciter_id: selectedReciterId
                        }
                    });
                }}
            >
                <GoldGradientBorder borderRadius={12}>
                    <View style={styles.surahCard}>
                        <View style={styles.surahInfo}>
                            <View style={styles.numberBadge}>
                                <Text style={styles.surahNumberText}>{item.id}</Text>
                            </View>
                            <View style={styles.nameContainer}>
                                <Text style={styles.surahNameEn}>{item.name_simple}</Text>
                                <Text style={styles.surahTranslationEn}>{item.translated_name?.name || ''}</Text>
                            </View>
                        </View>
                        <View style={styles.arabicContainer}>
                            <Text style={styles.surahNameAr}>{item.name_arabic}</Text>
                            <Text style={styles.ayahCount}>{item.verses_count} آيات</Text>
                        </View>
                    </View>
                </GoldGradientBorder>
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading) {
        return (
            <BackgroundPattern>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#bf9540" />
                    <Text style={styles.loadingText}>جاري التحميل...</Text>
                </View>
            </BackgroundPattern>
        );
    }

    return (
        <BackgroundPattern>
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>استماع</Text>
                    <Text style={styles.headerSubtitle}>QURAN RECITATION</Text>
                </View>

                <View style={styles.reciterSection}>
                    <Text style={styles.sectionTitle}>اختر القارئ</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.reciterList}
                    >
                        {reciters.map((reciter) => (
                            <TouchableOpacity
                                key={reciter.id}
                                style={[
                                    styles.reciterChip,
                                    selectedReciterId === reciter.id && styles.reciterChipSelected
                                ]}
                                onPress={() => setSelectedReciterId(reciter.id)}
                            >
                                <Text
                                    style={[
                                        styles.reciterName,
                                        selectedReciterId === reciter.id && styles.reciterNameSelected
                                    ]}
                                >
                                    {reciter.reciter_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={chapters}
                    renderItem={renderSurahItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={[
                        styles.listContent,
                        { paddingBottom: insets.bottom + 100 }
                    ]}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </BackgroundPattern>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#bf9540',
        fontFamily: 'Amiri_400Regular',
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 28,
        color: '#bf9540',
        letterSpacing: 2,
    },
    headerSubtitle: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        letterSpacing: 3,
        color: 'rgba(191, 149, 64, 0.6)',
        marginTop: -4,
    },
    reciterSection: {
        paddingVertical: 12,
    },
    sectionTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 18,
        color: '#ffffff',
        paddingHorizontal: 20,
        marginBottom: 12,
        textAlign: 'right',
    },
    reciterList: {
        paddingHorizontal: 16,
        gap: 8,
    },
    reciterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
    },
    reciterChipSelected: {
        backgroundColor: '#bf9540',
        borderColor: '#bf9540',
    },
    reciterName: {
        fontFamily: 'Lato_400Regular',
        fontSize: 13,
        color: 'rgba(191, 149, 64, 0.8)',
    },
    reciterNameSelected: {
        color: '#0a0c14',
        fontFamily: 'Lato_700Bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    surahCardContainer: {
        marginBottom: 12,
    },
    surahCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
    },
    surahInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    numberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.3)',
    },
    surahNumberText: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 12,
        color: '#bf9540',
    },
    nameContainer: {
        alignItems: 'flex-start',
    },
    surahNameEn: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 16,
        color: '#ffffff',
    },
    surahTranslationEn: {
        fontFamily: 'Lato_400Regular',
        fontSize: 11,
        color: 'rgba(191, 149, 64, 0.6)',
        marginTop: 2,
    },
    arabicContainer: {
        alignItems: 'flex-end',
    },
    surahNameAr: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 20,
        color: '#bf9540',
    },
    ayahCount: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 2,
    },
});

export default ListenScreen;
