import { useAudio } from '@/context/AudioContext';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const MiniPlayer = () => {
    const { trackInfo, isPlaying, progress, isMiniPlayerVisible, togglePlayPause, stopAndClear } = useAudio();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    if (!isMiniPlayerVisible || !trackInfo) return null;

    const toArabicNumerals = (num: number): string => {
        return num.toString().replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    };

    const progressValue = progress.durationMillis > 0
        ? progress.positionMillis / progress.durationMillis
        : 0;

    const handlePress = () => {
        router.push({
            pathname: '/listen/player',
            params: {
                chapter_id: trackInfo.surahId,
                reciter_name: trackInfo.reciterName,
                // Passing reciter_id if needed, but the player can also get it from context
            }
        });
    };

    // The tab bar is approximately 64px + padding + insets.bottom
    // We want the MiniPlayer to sit exactly above it.
    const tabBarHeight = 64 + 10 + 5 + Math.max(insets.bottom, 16);

    return (
        <View style={[styles.container, { bottom: tabBarHeight }]}>
            <BlurView intensity={95} tint="dark" style={styles.blurContainer}>
                {/* Progress Bar */}
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progressValue * 100}%` }]} />
                </View>

                <Pressable onPress={handlePress} style={styles.content}>
                    {/* Left: Play/Pause */}
                    <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                        <MaterialIcons
                            name={isPlaying ? "pause" : "play-arrow"}
                            size={32}
                            color="#bf9540"
                        />
                    </TouchableOpacity>

                    {/* Center: Track Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.title} numberOfLines={1}>
                            {trackInfo.surahName}
                        </Text>
                        <Text style={styles.subtitle} numberOfLines={1}>
                            الآية {toArabicNumerals(trackInfo.verseNumber)} • {trackInfo.reciterName}
                        </Text>
                    </View>

                    {/* Right: Close/Stop */}
                    <TouchableOpacity onPress={stopAndClear} style={styles.closeButton}>
                        <MaterialIcons name="close" size={20} color="rgba(191, 149, 64, 0.5)" />
                    </TouchableOpacity>
                </Pressable>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        height: 60,
        zIndex: 1000,
    },
    blurContainer: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.3)',
        backgroundColor: 'rgba(10, 12, 20, 0.4)',
    },
    progressBarBackground: {
        height: 2,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        width: '100%',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#bf9540',
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    controlButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 14,
        color: '#F5F5DC', // cream
    },
    subtitle: {
        fontFamily: 'Lato_400Regular',
        fontSize: 11,
        color: 'rgba(191, 149, 64, 0.7)',
        marginTop: 2,
    },
    closeButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
