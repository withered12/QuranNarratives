import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { StoryNode } from '@/components/ui/StoryNode';
import { getSurahList } from '@/services/quranApi';
import { MaterialCommunityIcons } from '@expo-vector-icons/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
    const surahs = getSurahList();

    const renderTimelineItem = ({ item, index }: { item: any, index: number }) => {
        const isLocked = index > 1; // Simulation for demo

        return (
            <View style={styles.timelineItemContainer}>
                {/* Story Node (Pearl) */}
                <View style={styles.nodeWrapper}>
                    <StoryNode size={20} glow={!isLocked} />
                </View>

                {/* Card */}
                <Link href={`/surah/${item.id}`} asChild>
                    <TouchableOpacity activeOpacity={0.9} style={styles.cardTouchable}>
                        {isLocked ? (
                            <View style={styles.lockedCard}>
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={styles.revelationText}>
                                            REVELATION {item.id.toString().padStart(2, '0')} • MECCAN
                                        </Text>
                                        <Text style={styles.surahName}>Sura {item.name_ar}</Text>
                                        <Text style={styles.surahTranslationLower}>{item.name_en}</Text>
                                    </View>
                                    <Text style={styles.surahNumberLocked}>{item.id}</Text>
                                </View>
                                <View style={styles.lockRow}>
                                    <MaterialCommunityIcons name="lock" size={14} color="rgba(191, 149, 64, 0.5)" />
                                    <Text style={styles.lockText}>COMPLETE PREVIOUS TO UNLOCK</Text>
                                </View>
                            </View>
                        ) : (
                            <GoldGradientBorder borderRadius={16}>
                                <View style={styles.cardContent}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.revelationTextGold}>
                                                REVELATION {item.id.toString().padStart(2, '0')} • MECCAN
                                            </Text>
                                            <Text style={styles.surahNameWhite}>Sura {item.name_ar}</Text>
                                            <Text style={styles.surahTranslationGold}>{item.name_en}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.surahNumberGold}>{item.id}</Text>
                                        </View>
                                    </View>

                                    <Text style={styles.surahSummary}>
                                        {item.stories?.[0]?.summary || "Exploring the divine narratives and profound wisdom revealed in this chapter of the Holy Quran."}
                                    </Text>

                                    <View style={styles.cardFooter}>
                                        <View style={styles.tagRow}>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>WISDOM</Text>
                                            </View>
                                            <View style={styles.tag}>
                                                <Text style={styles.tagText}>CREATION</Text>
                                            </View>
                                        </View>
                                        <View style={styles.exploreButton}>
                                            <Text style={styles.exploreText}>EXPLORE</Text>
                                            <MaterialCommunityIcons name="arrow-right" size={14} color="#bf9540" />
                                        </View>
                                    </View>
                                </View>
                            </GoldGradientBorder>
                        )}
                    </TouchableOpacity>
                </Link>
            </View>
        );
    };

    return (
        <BackgroundPattern>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>QURAN</Text>
                        <Text style={styles.headerSubtitle}>NARRATIVES</Text>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton}>
                            <MaterialCommunityIcons name="magnify" size={20} color="#bf9540" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <MaterialCommunityIcons name="account" size={20} color="#bf9540" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Timeline Selector */}
                <View style={styles.selectorContainer}>
                    <View style={styles.selector}>
                        <TouchableOpacity style={styles.selectorButtonActive}>
                            <Text style={styles.selectorTextActive}>CHRONOLOGICAL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.selectorButtonInactive}>
                            <Text style={styles.selectorTextInactive}>TRADITIONAL</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Timeline Content */}
                <View style={styles.timelineContent}>
                    {/* Central Vertical Line */}
                    <LinearGradient
                        colors={['rgba(191,149,64,0)', 'rgba(191,149,64,0.4)', 'rgba(191,149,64,0)']}
                        style={styles.timelineLine}
                    />

                    <FlatList
                        data={surahs}
                        renderItem={renderTimelineItem}
                        keyExtractor={item => item.id.toString()}
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
    headerTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 24,
        letterSpacing: 4,
        color: '#bf9540',
    },
    headerSubtitle: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        letterSpacing: 3,
        color: 'rgba(191, 149, 64, 0.8)',
        marginTop: -4,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 16,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(191, 149, 64, 0.05)',
    },
    selectorContainer: {
        paddingHorizontal: 24,
        marginBottom: 32,
        marginTop: 16,
    },
    selector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    selectorButtonActive: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#bf9540',
    },
    selectorButtonInactive: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    selectorTextActive: {
        fontSize: 10,
        fontFamily: 'Cinzel_700Bold',
        color: '#0a0c14',
        letterSpacing: 1,
    },
    selectorTextInactive: {
        fontSize: 10,
        fontFamily: 'Cinzel_400Regular',
        color: 'rgba(191, 149, 64, 0.6)',
        letterSpacing: 1,
    },
    timelineContent: {
        flex: 1,
        paddingHorizontal: 24,
    },
    timelineLine: {
        position: 'absolute',
        left: 24 + 10, // Match nodes
        top: 0,
        bottom: 0,
        width: 1,
    },
    timelineItemContainer: {
        position: 'relative',
        paddingLeft: 48,
        marginBottom: 40,
    },
    nodeWrapper: {
        position: 'absolute',
        left: 0,
        top: 16,
    },
    cardTouchable: {
        width: '100%',
    },
    lockedCard: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 20,
        opacity: 0.5,
    },
    cardContent: {
        backgroundColor: 'rgba(10, 12, 20, 0.95)',
        padding: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    revelationText: {
        fontSize: 10,
        fontFamily: 'Cinzel_400Regular',
        color: '#ffffff',
        letterSpacing: 1.5,
    },
    revelationTextGold: {
        fontSize: 10,
        fontFamily: 'Cinzel_400Regular',
        color: '#bf9540',
        letterSpacing: 1.5,
    },
    surahName: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 20,
        color: '#ffffff',
        marginTop: 4,
    },
    surahNameWhite: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 20,
        color: '#ffffff',
        marginTop: 4,
    },
    surahTranslationLower: {
        fontFamily: 'Newsreader_400Regular_Italic',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    surahTranslationGold: {
        fontFamily: 'Newsreader_400Regular_Italic',
        fontSize: 14,
        color: 'rgba(191, 149, 64, 0.7)',
    },
    surahNumberLocked: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 24,
        color: 'rgba(255, 255, 255, 0.2)',
    },
    surahNumberGold: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 24,
        color: 'rgba(191, 149, 64, 0.3)',
    },
    surahSummary: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
        fontFamily: 'Newsreader_400Regular',
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        borderRadius: 4,
    },
    tagText: {
        fontSize: 10,
        color: '#bf9540',
        fontFamily: 'Lato_700Bold',
        letterSpacing: 0.5,
    },
    exploreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    exploreText: {
        fontSize: 12,
        fontFamily: 'Lato_700Bold',
        color: '#bf9540',
        letterSpacing: 1,
    },
    lockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    lockText: {
        fontSize: 10,
        fontFamily: 'Lato_700Bold',
        color: 'rgba(191, 149, 64, 0.5)',
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: 120,
        paddingTop: 20,
    }
});
