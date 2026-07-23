import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Noorderlicht-achtergrond: een vooraf gerenderde afbeelding (zie
 * scratchpad/aurora.svg in de repo-historie) met een S-vormige teal-baan,
 * geelgroene horizon en paarse gloed, naar het referentiebeeld van de
 * ontwerper. Een statische asset rendert overal identiek en kost niets
 * aan runtime-performance. Daaroverheen een lichte donkere laag zodat
 * tekst en glas-kaarten genoeg contrast houden.
 */
export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={require('../../assets/aurora.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(8, 10, 30, 0.30)', 'rgba(8, 10, 30, 0.12)', 'rgba(8, 10, 30, 0.38)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
