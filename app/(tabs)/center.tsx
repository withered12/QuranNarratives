import { BackgroundPattern } from '@/components/ui/BackgroundPattern';
import { useMushafPage } from '@/hooks/useMushafPage';
import { MushafVerse } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack } from 'expo-router';
import React, { useRef } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

const generateHtml = (verses: MushafVerse[]): string => {
    const versesHtml = verses.map((verse) => {
        const ayahNumber = verse.verseKey.split(':')[1];
        return `${verse.textUthmani} <span class="ayah-num">﴿${ayahNumber}﴾</span>`;
    }).join(' ');

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <link href="https://fonts.googleapis.com/css2?family=Amiri&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #0a0c14;
            padding: 20px 25px;
            direction: rtl;
        }
        .verses {
            font-family: 'Amiri', serif;
            font-size: 24px;
            line-height: 2.2;
            color: #F5F5DC;
            text-align: justify;
            text-align-last: right;
            word-spacing: 3px;
        }
        .ayah-num {
            color: #bf9540;
            font-size: 20px;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="verses">${versesHtml}</div>
</body>
</html>
    `;
};

export default function MushafReader() {
    const webViewRef = useRef<WebView>(null);
    const {

        currentPage,
        verses,
        loading,
        error,
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
                    <View style={{ flex: 1 }}>
                        <WebView
                            ref={webViewRef}
                            originWhitelist={['*']}
                            source={{ html: generateHtml(verses) }}
                            style={{ flex: 1, backgroundColor: 'transparent' }}
                            showsVerticalScrollIndicator={false}
                            scrollEnabled={true}
                        />
                    </View>
                )}

                {renderFooter()}
            </SafeAreaView>
        </BackgroundPattern>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        marginBottom: 132, // Just above the raised center button
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
    footer: {
        height: 60,
        marginRight: 15,
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
