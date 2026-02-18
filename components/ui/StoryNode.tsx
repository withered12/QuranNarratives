import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StoryNodeProps {
    size?: number;
    glow?: boolean;
}

export const StoryNode: React.FC<StoryNodeProps> = ({
    size = 20,
    glow = true
}) => {
    return (
        <View style={[
            styles.container,
            { width: size, height: size },
            glow && styles.glow
        ]}>
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
    },
    pearl: {
        width: '100%',
        height: '100%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    core: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    glow: {
        shadowColor: '#bf9540',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 5,
    },
});
