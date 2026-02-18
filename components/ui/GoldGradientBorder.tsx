import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface GoldGradientBorderProps {
    children: React.ReactNode;
    borderRadius?: number;
    className?: string;
    style?: any;
}

export const GoldGradientBorder: React.FC<GoldGradientBorderProps> = ({
    children,
    borderRadius = 12,
    className = "",
    style = {}
}) => {
    return (
        <LinearGradient
            colors={['#8c6a26', '#bf9540', '#e5c17d', '#bf9540', '#8c6a26']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[styles.gradient, { borderRadius }, style]}
            className={className}
        >
            <View style={[styles.innerContainer, { borderRadius: borderRadius - 1 }]}>
                {children}
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        padding: 1,
    },
    innerContainer: {
        backgroundColor: '#0a0c14',
        overflow: 'hidden',
    },
});
