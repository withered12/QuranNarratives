import { Audio } from 'expo-av';

class AudioService {
    private static instance: AudioService;
    private sound: Audio.Sound | null = null;
    private currentUri: string | null = null;

    private constructor() { }

    public static getInstance(): AudioService {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }

    async playNewSound(uri: string, onPlaybackStatusUpdate?: (status: any) => void) {
        try {
            // Unload if already playing a different URI or just to be safe singleton-wise
            await this.stopCurrentSound();

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            this.sound = newSound;
            this.currentUri = uri;
            return newSound;
        } catch (error) {
            console.error('[AudioService] Error playing sound:', error);
            throw error;
        }
    }

    async stopCurrentSound() {
        if (this.sound) {
            try {
                await this.sound.unloadAsync();
            } catch (error) {
                console.warn('[AudioService] Error unloading sound:', error);
            } finally {
                this.sound = null;
                this.currentUri = null;
            }
        }
    }

    getCurrentUri() {
        return this.currentUri;
    }

    getSound() {
        return this.sound;
    }
}

export default AudioService.getInstance();
