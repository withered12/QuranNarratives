import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { getAllProphetsAr, getAllStories, getAllTagsAr } from '@/services/quranApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'Prophets' | 'Themes' | 'Chronicles';

export default function Codex() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('Prophets');
    const [searchQuery, setSearchQuery] = useState('');

    const prophets = getAllProphetsAr();
    const themes = getAllTagsAr();
    const featuredStories = getAllStories().slice(0, 5);

    const renderCategoryItem = (item: string) => (
        <TouchableOpacity
            key={item}
            style={styles.categoryCard}
            onPress={() => {
                // Navigate to home with Prophet name as query
                router.push({
                    pathname: '/',
                    params: { query: item }
                });
            }}
        >
            <GoldGradientBorder borderRadius={12}>
                <View style={styles.categoryContent}>
                    <Text style={styles.categoryTextAr}>{item}</Text>
                    <MaterialCommunityIcons name="chevron-left" size={16} color="#bf9540" />
                </View>
            </GoldGradientBorder>
        </TouchableOpacity>
    );

    const getTabLabel = (tab: Tab) => {
        switch (tab) {
            case 'Prophets': return 'الأنبياء';
            case 'Themes': return 'الموضوعات';
            case 'Chronicles': return 'سجلات';
            default: return tab;
        }
    };

    return (
        <BackgroundPattern>
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerSubtitle}>استكشف</Text>
                        <Text style={styles.headerTitle}>المخطوطة</Text>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchBackground}>
                            <MaterialCommunityIcons name="magnify" size={20} color="rgba(191, 149, 64, 0.6)" />
                            <TextInput
                                placeholder="الأنبياء، الموضوعات، أو الأماكن..."
                                placeholderTextColor="rgba(191, 149, 64, 0.4)"
                                style={styles.searchInput}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                textAlign="right"
                            />
                        </View>
                    </View>

                    {/* Tab Switcher */}
                    <View style={styles.tabContainer}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                            {(['Prophets', 'Themes', 'Chronicles'] as Tab[]).map((tab) => (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                                        {getTabLabel(tab)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Featured Sections */}
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>مختارات منتقاة</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                            {featuredStories.map((story) => (
                                <TouchableOpacity
                                    key={story.id}
                                    style={styles.featuredCard}
                                    onPress={() => {
                                        router.push({
                                            pathname: `/reader/${story.id}`,
                                            params: { surahId: story.surahId }
                                        });
                                    }}
                                >
                                    <GoldGradientBorder borderRadius={20} style={{ flex: 1 }}>
                                        <View style={styles.featuredContent}>
                                            <LinearGradient
                                                colors={['rgba(191,149,64,0.3)', 'transparent', 'rgba(10,12,20,0.9)']}
                                                style={styles.featuredOverlay}
                                            />
                                            <View style={styles.featuredTextContainer}>
                                                <Text style={styles.featuredTag}>
                                                    {story.tags_ar?.[0] || 'قصة إلهية'}
                                                </Text>
                                                <Text style={styles.featuredTitle}>{story.title_ar || story.title}</Text>
                                            </View>
                                        </View>
                                    </GoldGradientBorder>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* List Section */}
                    <View style={styles.listContainer}>
                        <Text style={styles.sectionTitle}>{getTabLabel(activeTab)}</Text>
                        <View style={styles.categoryGrid}>
                            {activeTab === 'Prophets' ? prophets.map(renderCategoryItem) :
                                activeTab === 'Themes' ? themes.map(renderCategoryItem) :
                                    ['سجل 1', 'سجل 2', 'سجل 3', 'سجل 4', 'سجل 5'].map(renderCategoryItem)}
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    headerSubtitle: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        letterSpacing: 4,
        color: 'rgba(191, 149, 64, 0.6)',
    },
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 28,
        color: '#bf9540',
        marginTop: 4,
        letterSpacing: 2,
    },
    searchContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    searchBackground: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.1)',
    },
    searchInput: {
        flex: 1,
        marginStart: 12,
        color: '#F5F5DC',
        fontFamily: 'Lato_700Bold',
        fontSize: 12,
        letterSpacing: 1,
        textAlign: 'auto',
    },
    tabContainer: {
        marginBottom: 32,
    },
    tabScroll: {
        paddingHorizontal: 24,
        gap: 12,
        flexDirection: 'row',
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
        backgroundColor: 'rgba(191, 149, 64, 0.02)',
    },
    tabButtonActive: {
        backgroundColor: '#bf9540',
        borderColor: '#bf9540',
    },
    tabText: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 14,
        color: 'rgba(191, 149, 64, 0.6)',
    },
    tabTextActive: {
        color: '#0a0c14',
    },
    sectionContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        paddingHorizontal: 24,
        marginBottom: 16,
        fontFamily: 'Cinzel_700Bold',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 2,
        textAlign: 'start',
    },
    featuredScroll: {
        paddingHorizontal: 24,
        gap: 16,
        flexDirection: 'row',
    },
    featuredCard: {
        width: 280,
        height: 180,
    },
    featuredContent: {
        flex: 1,
        backgroundColor: '#111827',
        borderRadius: 20,
        overflow: 'hidden',
    },
    featuredOverlay: {
        ...StyleSheet.absoluteFillObject,
    },
    featuredTextContainer: {
        position: 'absolute',
        bottom: 20,
        start: 20,
        end: 20,
        alignItems: 'flex-start',
    },
    featuredTag: {
        fontFamily: 'Lato_700Bold',
        fontSize: 8,
        color: '#bf9540',
        letterSpacing: 2,
        marginBottom: 4,
        textAlign: 'right',
    },
    featuredTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 22,
        color: '#ffffff',
        textAlign: 'right',
        width: '100%',
    },
    listContainer: {
        paddingHorizontal: 24,
    },
    categoryGrid: {
        gap: 12,
    },
    categoryCard: {
        width: '100%',
    },
    categoryContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
    },
    categoryTextAr: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 18,
        color: '#F5F5DC',
    }
});
