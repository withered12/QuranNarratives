import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { GoldGradientBorder } from '@/components/ui/GoldGradientBorder';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const version = Constants.expoConfig?.version || '1.0.0';

    const handleEmailSupport = () => {
        Linking.openURL('mailto:aburawi@outlook.com');
    };

    const Section = ({ title, children }: { title?: string, children: React.ReactNode }) => (
        <View style={styles.section}>
            {title && <Text style={styles.sectionTitle}>{title}</Text>}
            <View style={styles.sectionContent}>
                {children}
            </View>
        </View>
    );

    const Row = ({ label, value, onPress, isLast = false }: { label: string, value?: string, onPress?: () => void, isLast?: boolean }) => (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
            style={[styles.row, !isLast && styles.rowBorder]}
        >
            <View style={styles.rowContent}>
                <Text style={styles.rowLabel}>{label}</Text>
                <View style={styles.rowRight}>
                    {value && <Text style={styles.rowValue}>{value}</Text>}
                    {onPress && <MaterialCommunityIcons name="chevron-left" size={18} color="rgba(191, 149, 64, 0.4)" />}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <BackgroundPattern>
            <SafeAreaView style={styles.safeArea}>
                <Stack.Screen options={{ headerShown: false }} />

                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <GoldGradientBorder borderRadius={20}>
                                <View style={styles.logoBackground}>
                                    <Image
                                        source={require('../../assets/images/icon.png')}
                                        style={styles.logo}
                                    />
                                </View>
                            </GoldGradientBorder>
                        </View>
                        <Text style={styles.bannerTitle}>قصص القرآن</Text>
                        <Text style={styles.bannerSubtitle}>QURAN NARRATIVES</Text>
                        <View style={styles.versionBadge}>
                            <Text style={styles.versionText}>الإصدار v{version}</Text>
                        </View>
                    </View>

                    {/* App Info Section */}
                    <Section title="معلومات التطبيق">
                        <Row label="المطور" value="AAtech" />
                        <Row label="المؤلف" value="Ahmed Aburawi" isLast />
                    </Section>

                    {/* Data Sources Section */}
                    <Section title="مصادر البيانات">
                        <Row label="نص القرآن" value="الرسم العثماني" />
                        <Row label="التفسير" value="تفسير ابن كثير" />
                        <Row label="الروايات" value="أبحاث AAtech" isLast />
                    </Section>

                    {/* Support Section */}
                    <Section title="الدعم والمساعدة">
                        <Row
                            label="اتصل بالدعم الفني"
                            onPress={handleEmailSupport}
                            isLast
                        />
                    </Section>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            © 2026 AAtech. جميع الحقوق محفوظة.
                        </Text>
                        <Text style={styles.footerSubtext}>
                            صنع بكل ❤️ بواسطة أحمد أبورواي
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    logoBackground: {
        flex: 1,
        backgroundColor: '#0a0c14',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    bannerTitle: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 32,
        color: '#bf9540',
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontFamily: 'Cinzel_400Regular',
        fontSize: 10,
        color: 'rgba(191, 149, 64, 0.6)',
        letterSpacing: 4,
        marginTop: 4,
    },
    versionBadge: {
        marginTop: 12,
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.2)',
    },
    versionText: {
        color: '#bf9540',
        fontSize: 10,
        fontFamily: 'Lato_700Bold',
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontFamily: 'Cinzel_700Bold',
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.4)',
        letterSpacing: 2,
        marginBottom: 12,
    },
    sectionContent: {
        backgroundColor: 'rgba(10, 12, 20, 0.6)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.15)',
        overflow: 'hidden',
    },
    row: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    rowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(191, 149, 64, 0.1)',
    },
    rowLabel: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 18,
        color: '#F5F5DC',
    },
    rowValue: {
        fontFamily: 'Lato_400Regular',
        fontSize: 14,
        color: 'rgba(191, 149, 64, 0.6)',
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footer: {
        alignItems: 'center',
        paddingHorizontal: 24,
        marginTop: 20,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.3)',
        fontSize: 12,
        fontFamily: 'Lato_400Regular',
        textAlign: 'center',
    },
    footerSubtext: {
        color: 'rgba(191, 149, 64, 0.4)',
        fontSize: 10,
        fontFamily: 'Amiri_400Regular',
        marginTop: 4,
        textAlign: 'center',
    },
});
