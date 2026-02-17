import { View, Text, FlatList, Pressable, I18nManager } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { getSurahStories } from '../../services/quranApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SurahTimeline() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const isRTL = I18nManager.isRTL;

    const surahId = Array.isArray(id) ? id[0] : id;
    // @ts-ignore
    const data = getSurahStories(surahId || '');

    if (!data) {
        return (
            <View className="flex-1 bg-[#121212] justify-center items-center" style={{ flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' }}>
                <Text className="text-[#E0E0E0]" style={{ color: '#E0E0E0' }}>السورة غير موجودة</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-[#121212]" edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: '#121212' }}>
            <Stack.Screen options={{ headerShown: false }} />

            <View className="px-6 py-4 flex-row items-center justify-between" style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#D4AF37" />
                </Pressable>
                <Text className="text-2xl font-bold text-[#D4AF37]" style={{ color: '#D4AF37', fontSize: 28, fontWeight: 'bold' }}>سورة {data.name_ar}</Text>
                <View style={{ width: 40 }} />
            </View>

            <Text className="text-center text-gray-400 mb-6" style={{ textAlign: 'center', color: '#9CA3AF', marginBottom: 24 }}>التسلسل الزمني للقصص</Text>

            <FlatList
                data={data.stories}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                renderItem={({ item, index }) => (
                    <View className="flex-row items-start" style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* Timeline Line */}
                        <View className="items-center pt-2" style={{ alignItems: 'center', width: 24, marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0, paddingTop: 8 }}>
                            <View className="w-4 h-4 rounded-full bg-[#D4AF37] z-10" style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#D4AF37', zIndex: 10 }} />
                            {index < data.stories.length - 1 && (
                                <View className="w-0.5 h-full bg-gray-700 absolute top-4" style={{ width: 2, height: '100%', backgroundColor: '#374151', position: 'absolute', top: 16 }} />
                            )}
                        </View>

                        {/* Content */}
                        <Pressable
                            onPress={() => router.push({
                                pathname: `/reader/${item.id}`,
                                params: { surahId: surahId }
                            })}
                            className="flex-1 bg-[#1E1E1E] p-5 rounded-2xl mb-8 border border-gray-800"
                            style={{ flex: 1, backgroundColor: '#1E1E1E', padding: 20, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#1F2937', alignItems: isRTL ? 'flex-start' : 'flex-start' }}
                        >
                            <Text className="text-xl font-bold text-[#E0E0E0] mb-1" style={{ color: '#E0E0E0', fontSize: 20, fontWeight: 'bold', textAlign: isRTL ? 'left' : 'left' }}>{item.title_ar}</Text>
                            <Text className="text-[#D4AF37] text-sm mb-3 font-semibold" style={{ color: '#D4AF37', fontSize: 14, marginBottom: 12, fontWeight: '600' }}>الآيات {item.start_ayah} - {item.end_ayah}</Text>
                            <Text className="text-gray-400 text-sm leading-6" style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 24, textAlign: isRTL ? 'left' : 'left' }}>{item.summary_ar}</Text>
                        </Pressable>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}
