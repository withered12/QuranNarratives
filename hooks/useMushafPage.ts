import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { fetchMushafPage, prefetchMushafPage } from '../services/mushafApi';
import { MushafVerse } from '../types';

export const useMushafPage = (initialPage: number = 1) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [verses, setVerses] = useState<MushafVerse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const loadPage = useCallback(async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchMushafPage(page);
            setVerses(data);

            // Auto-scroll to top on page change
            scrollRef.current?.scrollTo({ y: 0, animated: false });

            // Prefetch next page
            if (page < 604) {
                prefetchMushafPage(page + 1);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load page');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPage(currentPage);
    }, [currentPage, loadPage]);

    const goToNextPage = useCallback(() => {
        if (currentPage < 604) {
            setCurrentPage(prev => prev + 1);
        }
    }, [currentPage]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    }, [currentPage]);

    const goToPage = useCallback((page: number) => {
        const clampedPage = Math.max(1, Math.min(604, page));
        setCurrentPage(clampedPage);
    }, []);

    return {
        currentPage,
        verses,
        loading,
        error,
        scrollRef,
        goToNextPage,
        goToPreviousPage,
        goToPage,
        retry: () => loadPage(currentPage),
    };
};
