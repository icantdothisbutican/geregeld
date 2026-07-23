import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

/**
 * Noorderlicht-achtergrond: een diepe indigo lucht met zachte teal- en
 * paarse banen. De banen zijn oversized, geroteerde gradients die naar
 * transparant uitlopen, zodat de randen buiten beeld vallen en alles
 * vloeiend in elkaar overloopt. Ligt achter alle schermen; de UI erboven
 * gebruikt glas-kaarten die dit door laten schemeren.
 */
export function AuroraBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Basislucht: paars bovenin, diep blauw onderin */}
      <LinearGradient
        colors={['#1C1240', '#131545', '#0C102E']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Hoofdbaan: teal, van rechtsboven slingerend naar beneden */}
      <LinearGradient
        colors={['transparent', 'rgba(45, 212, 170, 0.34)', 'rgba(74, 227, 181, 0.18)', 'transparent']}
        locations={[0, 0.42, 0.62, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.ribbon, {
          width: W * 1.6,
          height: H * 1.2,
          top: -H * 0.15,
          left: W * 0.05,
          transform: [{ rotate: '18deg' }],
        }]}
      />

      {/* Tweede baan: groen, lager en linkser */}
      <LinearGradient
        colors={['transparent', 'rgba(123, 228, 149, 0.20)', 'transparent']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.ribbon, {
          width: W * 1.4,
          height: H * 0.9,
          top: H * 0.35,
          left: -W * 0.4,
          transform: [{ rotate: '-14deg' }],
        }]}
      />

      {/* Paarse gloed linksboven */}
      <LinearGradient
        colors={['rgba(109, 74, 196, 0.30)', 'rgba(109, 74, 196, 0.10)', 'transparent']}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.9 }}
        style={[styles.ribbon, {
          width: W * 1.1,
          height: H * 0.8,
          top: -H * 0.1,
          left: -W * 0.25,
          transform: [{ rotate: '8deg' }],
        }]}
      />

      {/* Lichte groene gloed bij de horizon, zoals op de foto */}
      <LinearGradient
        colors={['transparent', 'rgba(190, 242, 158, 0.14)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.ribbon, {
          width: W * 1.2,
          height: H * 0.35,
          bottom: -H * 0.05,
          left: -W * 0.1,
        }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  ribbon: {
    position: 'absolute',
    borderRadius: 999,
  },
});
