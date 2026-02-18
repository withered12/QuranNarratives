import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';

const PATTERN_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCsXWTwIVHf1SyFPwsp-dRc-JophD0GTDtLuKQgiE3woyrs9s1ej282VhvYZnK--r2rWVeVOaKHbkuNSsboOLKVZblRsVE8ykFf7BloWwpURYYWtImx6aO8s8ydRPkr2e-gZkXn3pjpv6s25ph-qcGjMmkcFfBK3UYY_VYwl6n1_pOmPHprpA_UCb-e57DErfs_wKyMRDNXZei-r3Et0tKN5HYmkgc6L4YlydguZnI5JY09mXSnvMsYSEiWuq70L308oSXFyVGloPU";

export const BackgroundPattern: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: PATTERN_URL }}
                style={styles.pattern}
                imageStyle={styles.image}
                resizeMode="repeat"
            >
                {children}
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0c14',
    },
    pattern: {
        flex: 1,
    },
    image: {
        opacity: 0.1,
        tintColor: '#bf9540',
    },
});
