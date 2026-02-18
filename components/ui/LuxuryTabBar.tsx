import { MaterialCommunityIcons } from '@expo-vector-icons/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const LuxuryTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                <View style={styles.content}>
                    {state.routes.map((route, index) => {
                        const { options } = descriptors[route.key];
                        const isFocused = state.index === index;

                        const onPress = () => {
                            const event = navigation.emit({
                                type: 'tabPress',
                                target: route.key,
                                canPreventDefault: true,
                            });

                            if (!isFocused && !event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        };

                        const label = options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                        // Handle center button uniquely
                        if (route.name === 'center') {
                            return (
                                <View key={route.key} style={styles.centerButtonContainer}>
                                    <TouchableOpacity
                                        onPress={onPress}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#e5c17d', '#bf9540', '#8c6a26']}
                                            style={styles.centerButton}
                                        >
                                            <MaterialCommunityIcons name="book-open-variant" size={28} color="#0a0c14" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            );
                        }

                        const iconName = route.name === 'index' ? 'home' :
                            route.name === 'stories' ? 'library' :
                                route.name === 'saved' ? 'bookmark' :
                                    route.name === 'settings' ? 'cog' : 'square';

                        return (
                            <TouchableOpacity
                                key={route.key}
                                onPress={onPress}
                                style={styles.tabItem}
                            >
                                <MaterialCommunityIcons
                                    name={iconName as any}
                                    size={24}
                                    color={isFocused ? '#bf9540' : 'rgba(191, 149, 64, 0.4)'}
                                />
                                <Text style={[
                                    styles.label,
                                    { color: isFocused ? '#bf9540' : 'rgba(191, 149, 64, 0.4)' }
                                ]}>
                                    {label.toString().toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
    },
    blurContainer: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
        paddingTop: 10,
        paddingBottom: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        height: 64,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    centerButtonContainer: {
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerButton: {
        width: 58,
        height: 58,
        borderRadius: 29,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#0a0c14',
        shadowColor: '#bf9540',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    label: {
        fontSize: 8,
        fontFamily: 'Lato_700Bold',
        marginTop: 4,
        letterSpacing: 1,
    },
});
