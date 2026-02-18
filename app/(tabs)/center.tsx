import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { getSurahList } from '@/services/quranApi';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function CenterAction() {
    const router = useRouter();

    useEffect(() => {
        // Pick a random story to start reading
        const surahs = getSurahList();
        const validSurahs = surahs.filter(s => s.stories && s.stories.length > 0);

        if (validSurahs.length > 0) {
            const randomSurah = validSurahs[Math.floor(Math.random() * validSurahs.length)];
            const randomStory = randomSurah.stories[Math.floor(Math.random() * randomSurah.stories.length)];

            router.push({
                pathname: `/reader/${randomStory.id}`,
                params: { surahId: randomSurah.id }
            });
        } else {
            router.replace('/');
        }
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
