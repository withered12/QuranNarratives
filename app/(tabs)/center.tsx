import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function CenterAction() {
    const router = useRouter();

    useEffect(() => {
        // In a real app, this could open the last read story
        // For now, it just redirects to home or a featured story
        router.replace('/');
    }, []);

    return (
        <BackgroundPattern>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#bf9540" />
            </View>
        </BackgroundPattern>
    );
}
