import { View, Text, FlatList, Pressable, StatusBar, I18nManager, TextInput } from 'react-native';
import { Link, Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { getSurahList, searchStories } from '../../services/quranApi';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
    const router = useRouter();
    const surahs = getSurahList();
    const isRTL = I18nManager.isRTL;

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (text.length > 0) {
            const results = searchStories(text);
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#121212]" style={{ backgroundColor: '#121212', flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <View className="px-6 pt-4" style={{ paddingHorizontal: 24, paddingTop: 16 }}>
                {/* Header */}
                <View className="mb-6" style={{ marginBottom: 24 }}>
                    <Text className="text-4xl font-bold text-[#D4AF37] mb-2" style={{ color: '#D4AF37', fontSize: 36, fontWeight: 'bold', textAlign: 'left' }}>قصص القرآن</Text>
                    <Text className="text-[#E0E0E0] text-lg opacity-80" style={{ color: '#E0E0E0', fontSize: 18, textAlign: 'left' }}>استكشف القصص والعبر في آيات الذكر الحكيم.</Text>
                </View>

                {/* Smart Search Bar */}
                <View
                    className="flex-row items-center bg-[#1E1E1E] px-4 py-3 rounded-2xl mb-8 border border-gray-800"
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E1E1E', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, marginBottom: 32, borderWidth: 1, borderColor: '#1F2937' }}
                >
                    <Ionicons name="search" size={20} color="#6B7280" style={{ marginRight: 12 }} />
                    <TextInput
                        placeholder="ابحث عن نبي، موضوع، أو قصة..."
                        placeholderTextColor="#6B7280"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        className="flex-1 text-[#E0E0E0] text-base"
                        style={{ flex: 1, color: '#E0E0E0', fontSize: 16, textAlign: 'left' }}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => handleSearch('')}>
                            <Ionicons name="close-circle" size={20} color="#6B7280" />
                        </Pressable>
                    )}
                </View>

                {/* Search Results Overlay / Section */}
                {searchQuery.length > 0 ? (
                    <View style={{ flex: 1 }}>
                        <Text className="text-[#D4AF37] mb-4 font-bold" style={{ color: '#D4AF37', marginBottom: 16, fontWeight: 'bold' }}>نتائج البحث عن "{searchQuery}"</Text>
                        <FlatList
                            data={searchResults}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => {
                                        setSearchQuery('');
                                        router.push({
                                            pathname: `/reader/${item.id}`,
                                            params: { surahId: item.surahId }
                                        });
                                    }}
                                    className="bg-[#1E1E1E] p-4 rounded-xl mb-3 border border-[#D4AF37]/20"
                                    style={{ backgroundColor: '#1E1E1E', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)' }}
                                >
                                    <Text className="text-[#E0E0E0] font-bold" style={{ color: '#E0E0E0', fontWeight: 'bold' }}>{item.title_ar}</Text>
                                    <Text className="text-gray-500 text-xs" style={{ color: '#6B7280', fontSize: 12 }}>{item.title}</Text>
                                </Pressable>
                            )}
                            ListEmptyComponent={() => (
                                <Text style={{ color: '#6B7280', textAlign: 'center', marginTop: 20 }}>لم يتم العثور على قصص.</Text>
                            )}
                        />
                    </View>
                ) : (
                    <FlatList
                        data={surahs}
                        keyExtractor={(item) => item.id}
                        style={{ width: '100%' }}
                        renderItem={({ item }) => (
                            <Link href={`/surah/${item.id}`} asChild>
                                <Pressable
                                    className="bg-[#1E1E1E] p-6 rounded-2xl mb-4 border border-[#D4AF37]/20"
                                    style={{
                                        backgroundColor: '#1E1E1E',
                                        padding: 24,
                                        borderRadius: 16,
                                        marginBottom: 16,
                                        borderWidth: 1,
                                        borderColor: 'rgba(212, 175, 55, 0.2)',
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                        <Text className="text-2xl font-bold text-[#E0E0E0] mb-1" style={{ color: '#E0E0E0', fontSize: 22, fontWeight: 'bold' }}>سورة {item.name_ar}</Text>
                                        <Text className="text-gray-400" style={{ color: '#9CA3AF' }}>{item.stories.length} قصص متوفرة</Text>
                                    </View>
                                    <View
                                        className="bg-[#D4AF37]/20 w-12 h-12 rounded-full items-center justify-center"
                                        style={{ backgroundColor: 'rgba(212, 175, 55, 0.2)', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <Text className="text-[#D4AF37] font-bold text-lg" style={{ color: '#D4AF37', fontWeight: 'bold' }}>{item.id}</Text>
                                    </View>
                                </Pressable>
                            </Link>
                        )}
                        ListHeaderComponent={() => (
                            <View className="mb-4" style={{ marginBottom: 16 }}>
                                <Text className="text-[#D4AF37] font-semibold uppercase tracking-widest text-xs" style={{ color: '#D4AF37', letterSpacing: 1.5, fontSize: 12 }}>السور المختارة</Text>
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
