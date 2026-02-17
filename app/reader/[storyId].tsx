import { View, Text, FlatList, ActivityIndicator, Pressable, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { getStoryDetails, getStoryVerses } from '../../services/quranApi';
import { Ayah } from '../../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Reader() {
    const { storyId, surahId } = useLocalSearchParams();
    const router = useRouter();
    const isRTL = I18nManager.isRTL;

    const [ayahs, setAyahs] = useState<Ayah[]>([]);
    const [loading, setLoading] = useState(true);

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
                className="px-4 py-3 border-b border-gray-800 flex-row items-center justify-between bg-[#121212] z-10"
                style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1F2937', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#121212', zIndex: 10 }}
            >
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="close" size={26} color="#E0E0E0" />
                </Pressable>
                <View className="items-center flex-1" style={{ alignItems: 'center', flex: 1 }}>
                    <Text className="text-[#E0E0E0] font-bold text-lg" numberOfLines={1} style={{ color: '#E0E0E0', fontWeight: 'bold', fontSize: 22 }}>{story.title_ar}</Text>
                    <Text className="text-[#D4AF37] text-xs font-semibold" style={{ color: '#D4AF37', fontSize: 12, fontWeight: '600' }}>الآيات {story.start_ayah} - {story.end_ayah}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
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
                                className="text-right text-3xl text-[#E0E0E0] mb-8 leading-[64px]"
                                style={{ textAlign: 'right', fontSize: 32, color: '#E0E0E0', marginBottom: 32, lineHeight: 64, fontFamily: 'System' }}
                            >
                                {item.text}
                            </Text>

                            {/* English Translation */}
                            <Text className="text-gray-400 text-lg leading-7 font-normal" style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 28, textAlign: 'left' }}>
                                {item.translation}
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
