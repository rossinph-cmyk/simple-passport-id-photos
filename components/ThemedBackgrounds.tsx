import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AmericanThemedBackground() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#B22234', '#FFFFFF', '#3C3B6E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      {/* Subtle star pattern */}
      <View style={styles.starPattern}>
        {[...Array(6)].map((_, i) => (
          <View key={i} style={[styles.star, { top: `${15 + i * 15}%`, left: `${10 + (i % 2) * 30}%` }]} />
        ))}
      </View>
    </View>
  );
}

export function IndianThemedBackground() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9933', '#FFFFFF', '#138808']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      />
      {/* Subtle chakra-inspired pattern */}
      <View style={styles.chakraPattern}>
        <View style={styles.chakraOuter} />
        <View style={styles.chakraInner} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.15,
  },
  gradient: {
    flex: 1,
  },
  starPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    opacity: 0.3,
  },
  chakraPattern: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -60,
    marginTop: -60,
    width: 120,
    height: 120,
    opacity: 0.2,
  },
  chakraOuter: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#000080',
  },
  chakraInner: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000080',
  },
});
