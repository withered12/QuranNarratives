import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TextProps } from 'react-native';

interface GoldTextProps extends TextProps {
    children: string;
}

export const GoldText: React.FC<GoldTextProps> = (props) => {
    const { children, style, ...rest } = props;

    return (
        <MaskedView
            maskElement={
                <Text {...rest} style={[style, { backgroundColor: 'transparent' }]}>
                    {children}
                </Text>
            }
        >
            <LinearGradient
                colors={['#fceabb', '#fccd4d', '#f8b500', '#fbdf93']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <Text {...rest} style={[style, { opacity: 0 }]}>
                    {children}
                </Text>
            </LinearGradient>
        </MaskedView>
    );
};
