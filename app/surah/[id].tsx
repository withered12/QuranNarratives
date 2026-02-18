import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { StoryNode } from '@/components/ui/StoryNode';
import { getSurahStories } from '@/services/quranApi';
import { MaterialCommunityIcons } from '@expo-vector-icons/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SurahTimeline() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const surahId = Array.isArray(id) ? id[0] : id;
    const data = getSurahStories(surahId || '');

    if (!data) return null;

    const renderStoryItem = ({ item, index }: { item: any, index: number }) => {
        return (
            <View style={styles.timelineItemContainer}>
                <View style={styles.nodeWrapper}>
                    <StoryNode size={16} glow={true} />
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push({
                        pathname: `/reader/${item.id}`,
                        params: { surahId: surahId }
                    })}
                >
                    <GoldGradientBorder borderRadius={12}>
                        <View style={styles.cardContent}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.ayahRange}>AYATS {item.start_ayah} — {item.end_ayah}</Text>
                                    <Text style={styles.storyTitle}>{item.title_ar}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-right" size={20} color="#bf9540" />
                            </View>
                            <Text style={styles.storySummary} numberOfLines={3}>
                                {item.summary_ar}
                            </Text>
                        </View>
                    </GoldGradientBorder>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <BackgroundPattern>
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Sub Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#bf9540" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.subtitle}>SURAH</Text>
                        <Text style={styles.title}>{data.name_ar}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.content}>
                    {/* Central Vertical Line */}
                    <LinearGradient
                        colors={['rgba(191,149,64,0)', 'rgba(191,149,64,0.4)', 'rgba(191,149,64,0)']}
                        style={styles.timelineLine}
                    />

                    <FlatList
                        data={data.stories}
                        renderItem={renderStoryItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
    },
    titleContainer: {
        alignItems: 'center',
    },
    subtitle: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        letterSpacing: 3,
        color: 'rgba(191, 149, 64, 0.6)',
    },
    title: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 22,
        color: '#bf9540',
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    timelineLine: {
        position: 'absolute',
        left: 24 + 8, // Match nodes
        top: 0,
        bottom: 0,
        width: 1,
    },
    timelineItemContainer: {
        position: 'relative',
        paddingLeft: 40,
        marginBottom: 24,
    },
    nodeWrapper: {
        position: 'absolute',
        left: 0,
        top: 20,
    },
    cardContent: {
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ayahRange: {
        fontSize: 10,
        fontFamily: 'Lato_700Bold',
        color: 'rgba(191, 149, 64, 0.8)',
        letterSpacing: 1,
    },
    storyTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 18,
        color: '#ffffff',
        marginTop: 2,
    },
    storySummary: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'Newsreader_400Regular',
    },
    listContent: {
        paddingTop: 20,
        paddingBottom: 40,
    }
});
