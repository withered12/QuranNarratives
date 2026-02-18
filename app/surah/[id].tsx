import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { StoryNode } from '@/components/ui/StoryNode';
import { getSurahStories } from '@/services/quranApi';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SurahTimeline() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const surahId = Array.isArray(id) ? id[0] : id;
    const data = getSurahStories(surahId || '');
    const insets = useSafeAreaInsets();

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
                                    <Text style={styles.ayahRange}>الآيات {item.start_ayah} — {item.end_ayah}</Text>
                                    <Text style={styles.storyTitle}>{item.title_ar}</Text>
                                </View>
                                <MaterialCommunityIcons name="chevron-left" size={20} color="#bf9540" />
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
            <View style={[styles.safeArea, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />

                {/* Sub Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-right" size={24} color="#bf9540" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={styles.subtitle}>سورة</Text>
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
                        removeClippedSubviews={false}
                    />
                </View>
            </View>
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
        paddingHorizontal: 16, // Reduced
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
        fontFamily: 'Amiri_700Bold',
        fontSize: 26,
        color: '#bf9540',
        marginTop: 2,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16, // Reduced
        overflow: 'visible',
    },
    timelineLine: {
        position: 'absolute',
        start: 24,
        top: 0,
        bottom: 0,
        width: 1,
    },
    timelineItemContainer: {
        position: 'relative',
        paddingStart: 32, // Reduced
        marginBottom: 24,
        overflow: 'visible',
    },
    nodeWrapper: {
        position: 'absolute',
        start: 0, // Reduced
        top: 20,
        overflow: 'visible',
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
        fontFamily: 'Amiri_700Bold',
        color: 'rgba(191, 149, 64, 0.8)',
    },
    storyTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 20,
        color: '#ffffff',
        marginTop: 2,
        textAlign: 'right',
    },
    storySummary: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        lineHeight: 22,
        fontFamily: 'Amiri_400Regular',
        textAlign: 'right',
    },
    listContent: {
        paddingTop: 20,
        paddingBottom: 40,
    }
});
