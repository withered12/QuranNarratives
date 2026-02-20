import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavedScreen() {
    return (
        <BackgroundPattern>
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <Text className="text-right w-full" style={styles.headerSubtitle}>المحفوظات</Text>
                    <Text className="text-right w-full" style={styles.headerTitle}>مكتبتي</Text>
                </View>

                <View style={styles.centered}>
                    <MaterialCommunityIcons name="bookmark-outline" size={64} color="rgba(191, 149, 64, 0.2)" />
                    <Text className="text-center" style={styles.placeholderText}>لا توجد قصص محفوظة بعد</Text>
                </View>
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    header: { paddingHorizontal: 24, paddingTop: 24, width: '100%' },
    headerSubtitle: { fontFamily: 'Amiri_400Regular', fontSize: 12, letterSpacing: 1, color: 'rgba(191, 149, 64, 0.6)' },
    headerTitle: { fontFamily: 'Amiri_700Bold', fontSize: 28, color: '#bf9540', marginTop: 4 },
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    placeholderText: { fontFamily: 'Amiri_400Regular', fontSize: 18, color: 'rgba(245, 245, 220, 0.4)', marginTop: 20 },
});
