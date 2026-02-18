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
    const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

    const opacity = useSharedValue(1); // Start fully opaque

    useEffect(() => {
        if (glow) {
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1000 }), // Dim slightly
                    withTiming(1, { duration: 1000 })    // Return to full brightness
                ),
                -1,
                true
            );
        } else {
            opacity.value = 1;
        }
    }, [glow]);

    const animatedStyles = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={[
            styles.container,
            { width: size, height: size },
        ]}>
            <AnimatedLinearGradient
                colors={['#e5c17d', '#bf9540', '#8c6a26']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.pearl,
                    { borderRadius: size / 2 },
                    animatedStyles
                ]}
            >
                <View style={[styles.core, { width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2 }]} />
            </AnimatedLinearGradient>
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
});
