import { View, Text, FlatList, ActivityIndicator, Pressable, I18nManager, useWindowDimensions, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getStoryDetails, getStoryVerses } from '../../services/quranApi';
import { fetchAndMergeNarrative } from '../../services/TafsirService';
import { Ayah } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import RenderHTML from 'react-native-render-html';

export default function Reader() {
    const { storyId, surahId } = useLocalSearchParams();
    const router = useRouter();
    const isRTL = I18nManager.isRTL;

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'verses' | 'story'>('verses');
    const [tafsirData, setTafsirData] = useState<string[]>([]);
    const [loadingTafsir, setLoadingTafsir] = useState(false);

    // Dynamic Alignment Strategy:
    // Empirical fix: User reports 'left' aligns to Right side, and 'right' aligns to Left side.
    // So we align Arabic to 'left' (for Right appearance) and English to 'right' (for Left appearance).
    const alignAr = 'left';
    const alignEn = 'right';

    const { width } = useWindowDimensions();

    const sId = Array.isArray(storyId) ? storyId[0] : storyId;
    const surahIdStr = Array.isArray(surahId) ? surahId[0] : surahId;

    // @ts-ignore
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

    useEffect(() => {
        if (activeTab === 'story' && tafsirData.length === 0 && story && surahIdStr) {
            loadTafsir();
        }
    }, [activeTab, story, surahIdStr]);

    const loadTafsir = async () => {
        if (!story || !surahIdStr) return;
        setLoadingTafsir(true);
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

    if (!story) {
        return (
            <View className="flex-1 bg-[#121212] justify-center items-center" style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-[#E0E0E0]" style={{ color: '#E0E0E0' }}>القصة غير موجودة</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#121212]" edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#121212' }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View
                className="px-4 py-3 bg-[#121212] z-10"
                style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#121212', zIndex: 10 }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Pressable onPress={() => router.back()} className="p-2">
                        <Ionicons name="close" size={26} color="#E0E0E0" />
                    </Pressable>
                    <View className="items-center flex-1" style={{ alignItems: 'center', flex: 1 }}>
                        <Text className="text-[#E0E0E0] font-bold text-lg" numberOfLines={1} style={{ color: '#E0E0E0', fontWeight: 'bold', fontSize: 20, textAlign: 'center' }}>{story.title_ar}</Text>
                        <Text className="text-[#D4AF37] text-xs font-semibold" style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>الآيات {story.start_ayah} - {story.end_ayah}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                {/* Tab Switcher */}
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: '#1E1E1E',
                        borderRadius: 12,
                        padding: 4,
                        marginTop: 4
                    }}
                >
                    <Pressable
                        onPress={() => setActiveTab('verses')}
                        style={{
                            flex: 1,
                            paddingVertical: 8,
                            alignItems: 'center',
                            borderRadius: 8,
                            backgroundColor: activeTab === 'verses' ? '#D4AF37' : 'transparent'
                        }}
                    >
                        <Text style={{ color: activeTab === 'verses' ? '#121212' : '#9CA3AF', fontWeight: 'bold' }}>الآيات</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setActiveTab('story')}
                        style={{
                            flex: 1,
                            paddingVertical: 8,
                            alignItems: 'center',
                            borderRadius: 8,
                            backgroundColor: activeTab === 'story' ? '#D4AF37' : 'transparent'
                        }}
                    >
                        <Text style={{ color: activeTab === 'story' ? '#121212' : '#9CA3AF', fontWeight: 'bold' }}>القصة كاملة</Text>
                    </Pressable>
                </View>
            </View>

            {activeTab === 'verses' ? (
                loading ? (
                    <View className="flex-1 justify-center items-center" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color="#D4AF37" size="large" />
                        <Text className="text-[#D4AF37] mt-4 opacity-70" style={{ color: '#D4AF37', marginTop: 16, opacity: 0.7 }}>جاري تحميل الآيات...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={ayahs}
                        keyExtractor={(item) => item.number.toString()}
                        contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
                        renderItem={({ item }) => (
                            <View className="mb-10 bg-[#1E1E1E] p-6 rounded-3xl border border-gray-800/50" style={{ marginBottom: 40, backgroundColor: '#1E1E1E', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(31, 41, 55, 0.5)' }}>
                                {/* Ayah Number Badge */}
                                <View className="flex-row justify-between mb-6" style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
                                    <View
                                        className="border border-[#D4AF37]/30 rounded-full w-10 h-10 items-center justify-center bg-[#D4AF37]/10"
                                        style={{ borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                                    >
                                        <Text className="text-[#D4AF37] text-xs font-bold" style={{ color: '#D4AF37', fontSize: 12, fontWeight: 'bold' }}>{item.number}</Text>
                                    </View>
                                    <View />
                                </View>

                                {/* Arabic Text */}
                                <Text
                                    className="text-3xl text-[#E0E0E0] mb-8 leading-[64px]"
                                    style={{ fontSize: 32, color: '#E0E0E0', marginBottom: 32, lineHeight: 64, fontFamily: 'System', textAlign: alignAr }}
                                >
                                    {item.text}
                                </Text>

                                {/* English Translation */}
                                <Text className="text-gray-400 text-lg leading-7 font-normal" style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 28, textAlign: alignEn }}>
                                    {item.translation}
                                </Text>
                            </View>
                        )}
                    />
                )
            ) : (
                loadingTafsir ? (
                    <View className="flex-1 justify-center items-center" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator color="#D4AF37" size="large" />
                        <Text className="text-[#D4AF37] mt-4 opacity-70" style={{ color: '#D4AF37', marginTop: 16, opacity: 0.7 }}>جاري سرد القصة...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
                        <View className="bg-[#1E1E1E] p-6 rounded-3xl border border-gray-800/50" style={{ backgroundColor: '#1E1E1E', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(31, 41, 55, 0.5)' }}>
                            {tafsirData.map((text, index) => {
                                const isArabicTafsir = (story.preferred_tafsir_source || 14) === 14;
                                const alignment = isArabicTafsir ? alignAr : alignEn;

                                return (
                                    <View key={index} style={{ marginBottom: 24 }}>
                                        <RenderHTML
                                            contentWidth={width - 80}
                                            source={{ html: text }}
                                            tagsStyles={{
                                                p: { color: '#E0E0E0', fontSize: 18, lineHeight: 28, textAlign: alignment },
                                                div: { color: '#E0E0E0', fontSize: 18, lineHeight: 28, textAlign: alignment },
                                                span: { color: '#E0E0E0', textAlign: alignment },
                                                a: { color: '#D4AF37' }
                                            }}
                                        />
                                        {index < tafsirData.length - 1 && (
                                            <View style={{ height: 1, backgroundColor: 'rgba(212, 175, 55, 0.1)', marginVertical: 20 }} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </ScrollView>
                )
            )}
        </SafeAreaView>
    );
}
