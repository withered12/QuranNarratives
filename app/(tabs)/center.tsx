import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useMushafPage } from '@/hooks/useMushafPage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MushafReader() {
    const {
        currentPage,
        verses,
        loading,
        error,
        scrollRef,
        goToNextPage,
        goToPreviousPage,
        retry
    } = useMushafPage(1);

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerSide}>
                <TouchableOpacity>
                    <Ionicons name="settings-outline" size={24} color="#bf9540" />
                </TouchableOpacity>
            </View>

            <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>الصفحة {currentPage}</Text>
            </View>

            <View style={styles.headerSide}>
                <TouchableOpacity onPress={() => {/* Back logic if needed */ }}>
                    <Ionicons name="chevron-forward" size={28} color="#bf9540" />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderFooter = () => (
        <BlurView intensity={80} tint="dark" style={styles.footer}>
            <View style={styles.footerContent}>
                {/* Right Button: Previous Page (Higher physical index in RTL = Right side) */}
                <TouchableOpacity
                    onPress={goToPreviousPage}
                    disabled={currentPage === 1 || loading}
                    style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
                >
                    <Ionicons name="chevron-forward" size={24} color="#bf9540" />
                    <Text style={styles.navButtonText}>الصفحة السابقة</Text>
                </TouchableOpacity>

                <View style={styles.pageIndicator}>
                    <Text style={styles.pageIndicatorText}>{currentPage} / 604</Text>
                </View>

                {/* Left Button: Next Page (Lower physical index in RTL = Left side) */}
                <TouchableOpacity
                    onPress={goToNextPage}
                    disabled={currentPage === 604 || loading}
                    style={[styles.navButton, currentPage === 604 && styles.disabledButton]}
                >
                    <Text style={styles.navButtonText}>الصفحة التالية</Text>
                    <Ionicons name="chevron-back" size={24} color="#bf9540" />
                </TouchableOpacity>
            </View>
        </BlurView>
    );

    return (
        <BackgroundPattern>
            <Stack.Screen options={{ headerShown: false }} />
            <SafeAreaView style={styles.safeArea}>
                {renderHeader()}

                {loading && verses.length === 0 ? (
                    <View style={styles.centered}>
                        <ActivityIndicator size="large" color="#bf9540" />
                    </View>
                ) : error ? (
                    <View style={styles.centered}>
                        <Text style={styles.errorText}>حدث خطأ أثناء تحميل الصفحة</Text>
                        <TouchableOpacity onPress={retry} style={styles.retryButton}>
                            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        ref={scrollRef}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.versesContainer}>
                            <Text style={styles.versesText}>
                                {verses.map((verse) => {
                                    const ayahNumber = verse.verseKey.split(':')[1];
                                    return (
                                        <Text key={verse.id}>
                                            {verse.textUthmani}
                                            <Text style={styles.ayahNumber}> ﴿{ayahNumber}﴾ </Text>
                                        </Text>
                                    );
                                })}
                            </Text>
                        </View>
                        {/* Space for footer */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                )}

                {renderFooter()}
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(191, 149, 64, 0.3)',
    },
    headerSide: {
        width: 40,
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        color: '#bf9540',
        fontSize: 20,
        fontFamily: 'Cinzel_700Bold',
    },
    scrollContent: {
        paddingTop: 20,
    },
    versesContainer: {
        paddingHorizontal: 25,
    },
    versesText: {
        fontSize: 32,
        lineHeight: 64,
        fontFamily: 'Amiri_400Regular',
        color: '#F5F5DC',
        textAlign: 'right',
        writingDirection: 'rtl',
    },
    ayahNumber: {
        color: '#bf9540',
        fontFamily: 'Amiri_400Regular',
        fontSize: 24,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        borderTopWidth: 0.5,
        borderTopColor: 'rgba(191, 149, 64, 0.3)',
    },
    footerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 10, // Account for safe area roughly
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    disabledButton: {
        opacity: 0.3,
    },
    navButtonText: {
        color: '#bf9540',
        fontSize: 14,
        fontFamily: 'Lato_700Bold',
        marginHorizontal: 5,
    },
    pageIndicator: {
        backgroundColor: 'rgba(191, 149, 64, 0.1)',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(191, 149, 64, 0.3)',
    },
    pageIndicatorText: {
        color: '#F5F5DC',
        fontSize: 16,
        fontFamily: 'Cinzel_700Bold',
    },
    errorText: {
        color: '#F5F5DC',
        fontSize: 16,
        fontFamily: 'Lato_400Regular',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#bf9540',
        paddingHorizontal: 25,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#0a0c14',
        fontSize: 16,
        fontFamily: 'Lato_700Bold',
    },
});
