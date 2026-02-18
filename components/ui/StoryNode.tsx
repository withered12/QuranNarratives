import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

interface StoryNodeProps {
    size?: number;
    glow?: boolean;
}

export const StoryNode: React.FC<StoryNodeProps> = ({
    size = 20,
    glow = true
}) => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.4);

    useEffect(() => {
        if (glow) {
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.5, { duration: 1500 }),
                    withTiming(1, { duration: 1500 })
                ),
                -1,
                true
            );
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1500 }),
                    withTiming(0.2, { duration: 1500 })
                ),
                -1,
                true
            );
        } else {
            scale.value = 1;
            opacity.value = 0.4;
        }
    }, [glow]);

    const animatedGlowStyles = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <View style={[
            styles.container,
            { width: size, height: size },
        ]}>
            {glow && (
                <Animated.View
                    style={[
                        styles.glowRing,
                        {
                            width: size * 2.5,
                            height: size * 2.5,
                            borderRadius: size * 1.25,
                            backgroundColor: '#bf9540',
                        },
                        animatedGlowStyles
                    ]}
                />
            )}
            <LinearGradient
                colors={['#e5c17d', '#bf9540', '#8c6a26']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.pearl, { borderRadius: size / 2 }]}
            >
                <View style={[styles.core, { width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2 }]} />
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
        overflow: 'visible',
    },
    pearl: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
    },
    core: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    glowRing: {
        position: 'absolute',
        shadowColor: '#bf9540',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
    },
});
