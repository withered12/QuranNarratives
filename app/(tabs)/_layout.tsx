import { MiniPlayer } from '@/components/MiniPlayer';
import { LuxuryTabBar } from '@/components/ui/LuxuryTabBar';
import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <LuxuryTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'الرئيسية',
          }}
        />
        <Tabs.Screen
          name="stories"
          options={{
            title: 'القصص',
          }}
        />
        <Tabs.Screen
          name="center"
          options={{
            title: 'القارئ',
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'المحفوظات',
          }}
        />
        <Tabs.Screen
          name="listen"
          options={{
            title: 'استماع',
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
