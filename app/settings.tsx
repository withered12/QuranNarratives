import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { I18nManager, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const version = Constants.expoConfig?.version || '1.0.0';
    const isRTL = I18nManager.isRTL;

    const handleEmailSupport = () => {
        Linking.openURL('mailto:qn@databridge.ly');
    };

    const Section = ({ title, children }: { title?: string, children: React.ReactNode }) => (
        <View className="mb-6">
            {title && <Text className="px-4 mb-2 text-gray-500 uppercase text-xs font-semibold tracking-wider text-left">{title}</Text>}
            <View className="bg-white border-t border-b border-gray-200">
                {children}
            </View>
        </View>
    );

    const Row = ({ label, value, onPress, showChevron = false, isLast = false }: { label: string, value?: string, onPress?: () => void, showChevron?: boolean, isLast?: boolean }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
            className={`flex-row items-center justify-between px-4 py-3 bg-white ${!isLast ? 'border-b border-gray-200' : ''}`}
        >
            <Text className="text-base text-black font-medium">{label}</Text>
            <View className="flex-row items-center">
                {value && <Text className="text-gray-500 text-sm mr-2">{value}</Text>}
                {showChevron && <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color="#C7C7CC" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#F2F2F7]">
            <Stack.Screen
                options={{
                    headerTitle: "Settings & Info",
                    headerStyle: { backgroundColor: "#F2F2F7" },
                    headerTintColor: "#000",
                    headerShadowVisible: false,
                    contentStyle: { backgroundColor: "#F2F2F7" },
                }}
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View className="items-center py-8">
                    <View className="w-20 h-20 bg-white rounded-xl shadow-sm items-center justify-center mb-3">
                        <Image
                            source={require('../assets/images/icon.png')}
                            style={{ width: 60, height: 60, borderRadius: 10 }}
                        />
                    </View>
                    <Text className="text-xl font-bold text-black">QuranNarratives</Text>
                    <Text className="text-lg font-semibold text-[#D4AF37] mb-1">قصص القرآن</Text>
                    <Text className="text-gray-500 text-sm">v{version}</Text>
                </View>

                {/* App Info Section */}
                <Section title="APP INFO">
                    <Row label="Developer" value="شركة جسر البيانات" />
                    <Row label="Author" value="Ahmed Aburawi" isLast />
                </Section>

                {/* Data Sources Section */}
                <Section title="DATA SOURCES">
                    <Row label="Quran Text" value="الرسم العثماني" />
                    <Row label="Tafsir" value="تفسير ابن كثير" />
                    <Row label="Narratives" value="Data Bridge Solutions Research" isLast />
                </Section>

                {/* Support Section */}
                <Section title="SUPPORT">
                    <Row
                        label="Contact Support"
                        onPress={handleEmailSupport}
                        showChevron
                        isLast
                    />
                </Section>

                {/* Footer */}
                <View className="items-center mt-8 px-4">
                    <Text className="text-gray-400 text-xs text-center">
                        © 2026 Data Bridge Solutions. All rights reserved.
                    </Text>
                    <Text className="text-gray-400 text-xs text-center mt-1">
                        Made by Ahmed Aburawi
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
