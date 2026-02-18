import { View, Text, FlatList, Pressable, ScrollView, I18nManager } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { getAllStories, getAllProphetsAr, getAllTagsAr, getChronologicalStories } from '../../services/quranApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'Prophets' | 'Themes' | 'Timeline';

export default function Codex() {
    const router = useRouter();
    const isRTL = I18nManager.isRTL;
    const [activeTab, setActiveTab] = useState<Tab>('Prophets');
    const [filter, setFilter] = useState<string | null>(null);

    const prophets = getAllProphetsAr();
    const tags = getAllTagsAr();
    const allStories = getAllStories();
    const chronoStories = getChronologicalStories();

    const filteredStories = allStories.filter(s => {
        if (!filter) return false;
        if (activeTab === 'Prophets') return s.prophets_ar?.includes(filter);
        if (activeTab === 'Themes') return s.tags_ar?.includes(filter);
        return true;
    });

    const renderStoryItem = ({ item }: { item: any }) => (
        <Pressable
            onPress={() => router.push({
                pathname: `/reader/${item.id}`,
                params: { surahId: item.surahId }
            })}
            className="bg-[#1E1E1E] p-4 rounded-xl mb-4 border border-gray-800"
            style={{ backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View className="flex-1">
                    <Text className="text-lg font-bold text-[#E0E0E0]" style={{ color: '#E0E0E0', fontSize: 18, fontWeight: 'bold', textAlign: 'right' }}>{item.title_ar}</Text>
                    <Text className="text-[#D4AF37] text-xs" style={{ color: '#D4AF37', fontSize: 12, textAlign: 'left' }}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D4AF37" />
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView className="flex-1 bg-[#121212]" style={{ flex: 1, backgroundColor: '#121212' }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between" style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                <Pressable onPress={() => router.back()} className="p-2">
                    <Ionicons name="arrow-forward" size={24} color="#D4AF37" />
                </Pressable>
                <Text className="text-2xl font-bold text-[#D4AF37]" style={{ color: '#D4AF37', fontSize: 28, fontWeight: 'bold' }}>الفهرس العام</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Custom Tab Bar */}
            <View className="flex-row px-4 mb-6" style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 24 }}>
                {(['Prophets', 'Themes', 'Timeline'] as Tab[]).map((tab) => (
                    <Pressable
                        key={tab}
                        onPress={() => { setActiveTab(tab); setFilter(null); }}
                        className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-[#D4AF37]' : ''}`}
                        style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: activeTab === tab ? 2 : 0, borderBottomColor: '#D4AF37' }}
                    >
                        <Text
                            className={`font-semibold ${activeTab === tab ? 'text-[#D4AF37]' : 'text-gray-500'}`}
                            style={{ color: activeTab === tab ? '#D4AF37' : '#6B7280', fontWeight: 'bold' }}
                        >
                            {tab === 'Prophets' ? 'الأنبياء' : tab === 'Themes' ? 'المواضيع' : 'التسلسل التاريخي'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View className="flex-1 px-6" style={{ flex: 1, paddingHorizontal: 24 }}>
                {activeTab === 'Prophets' && !filter && (
                    <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        {prophets.map(p => (
                            <Pressable
                                key={p}
                                onPress={() => setFilter(p)}
                                className="bg-[#1E1E1E] px-4 py-2 rounded-full m-1 border border-[#D4AF37]/30"
                                style={{ backgroundColor: '#1E1E1E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, margin: 4, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.3)' }}
                            >
                                <Text style={{ color: '#E0E0E0', fontSize: 16 }}>{p}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {activeTab === 'Themes' && !filter && (
                    <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        {tags.map(t => (
                            <Pressable
                                key={t}
                                onPress={() => setFilter(t)}
                                className="bg-[#D4AF37]/10 px-4 py-2 rounded-lg m-1 border border-[#D4AF37]/20"
                                style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, margin: 4, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }}
                            >
                                <Text style={{ color: '#D4AF37', fontSize: 14 }}>#{t}</Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}

                {activeTab === 'Timeline' && (
                    <FlatList
                        data={chronoStories}
                        keyExtractor={(item) => item.id}
                        renderItem={renderStoryItem}
                        ListHeaderComponent={() => (
                            <Text className="text-gray-500 mb-4 text-xs italic" style={{ color: '#6B7280', marginBottom: 16, textAlign: 'center' }}>
                                ترتيب القصص حسب التسلسل الزمني للأنبياء
                            </Text>
                        )}
                    />
                )}

                {filter && (activeTab === 'Prophets' || activeTab === 'Themes') && (
                    <View style={{ flex: 1 }}>
                        <View className="flex-row justify-between items-center mb-4" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Pressable onPress={() => setFilter(null)}>
                                <Text style={{ color: '#D4AF37', fontSize: 16 }}>إلغاء</Text>
                            </Pressable>
                            <Text className="text-[#E0E0E0] font-bold text-lg" style={{ color: '#E0E0E0', fontWeight: 'bold', fontSize: 18 }}>{filter}</Text>
                        </View>
                        <FlatList
                            data={filteredStories}
                            keyExtractor={(item) => item.id}
                            renderItem={renderStoryItem}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
