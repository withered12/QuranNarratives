import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface TrackInfo {
    surahName: string;
    verseNumber: number;
    reciterName: string;
    surahId: number | string;
}

interface Progress {
    positionMillis: number;
    durationMillis: number;
}

interface AudioContextType {
    sound: Audio.Sound | null;
    isPlaying: boolean;
    trackInfo: TrackInfo | null;
    progress: Progress;
    isMiniPlayerVisible: boolean;
    loadAndPlayAudio: (trackData: TrackInfo, url: string, onFinish?: () => void) => Promise<void>;
    togglePlayPause: () => Promise<void>;
    stopAndClear: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
    const [progress, setProgress] = useState<Progress>({ positionMillis: 0, durationMillis: 0 });
    const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(false);
    const onFinishRef = useRef<(() => void) | undefined>(undefined);

    // Configure audio once on mount
    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
        });

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
            const errorStatus = status as any;
            if (errorStatus.error) {
                console.error(`[AudioContext] Playback error: ${errorStatus.error}`);
            }
            return;
        }

        const successStatus = status as AVPlaybackStatusSuccess;

        setIsPlaying(successStatus.isPlaying);
        setProgress({
            positionMillis: successStatus.positionMillis,
            durationMillis: successStatus.durationMillis || 0,
        });

        if (successStatus.didJustFinish) {
            if (onFinishRef.current) {
                onFinishRef.current();
            }
        }
    };

    const loadAndPlayAudio = async (trackData: TrackInfo, url: string, onFinish?: () => void) => {
        try {
            console.log(`[AudioContext] Loading audio from URL: ${url}`);
            // Unload current sound if it exists
            if (sound) {
                await sound.unloadAsync();
            }

            onFinishRef.current = onFinish;

            const { sound: newSound } = await Audio.Sound.createAsync(
                {
                    uri: url,
                    // Help Android extractor identify the format
                    overrideFileExtensionAndroid: 'mp3'
                },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            console.log(`[AudioContext] Successfully loaded audio: ${url}`);

            setSound(newSound);
            setTrackInfo(trackData);
            setIsMiniPlayerVisible(true);
            setIsPlaying(true);
        } catch (error) {
            console.error('[AudioContext] Error loading audio:', error);
        }
    };

    const togglePlayPause = async () => {
        if (!sound) return;

        try {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
        } catch (error) {
            console.error('[AudioContext] Error toggling play/pause:', error);
        }
    };

    const stopAndClear = async () => {
        if (sound) {
            try {
                await sound.stopAsync();
                await sound.unloadAsync();
            } catch (error) {
                console.error('[AudioContext] Error stopping audio:', error);
            }
        }
        setSound(null);
        setTrackInfo(null);
        setIsMiniPlayerVisible(false);
        setIsPlaying(false);
        setProgress({ positionMillis: 0, durationMillis: 0 });
    };

    return (
        <AudioContext.Provider
            value={{
                sound,
                isPlaying,
                trackInfo,
                progress,
                isMiniPlayerVisible,
                loadAndPlayAudio,
                togglePlayPause,
                stopAndClear,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
