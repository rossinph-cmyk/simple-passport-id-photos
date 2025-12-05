import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function AmericanThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Horizontal stripes pattern */}
      <View style={styles.stripesContainer}>
        {[...Array(13)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.stripe,
              { backgroundColor: i % 2 === 0 ? '#DC143C' : '#FFFFFF' }
            ]}
          />
        ))}
      </View>
      {/* Blue canton with stars */}
      <View style={styles.canton}>
        <View style={styles.starField}>
          {[...Array(15)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  top: `${(Math.floor(i / 5) * 25 + 12)}%`,
                  left: `${((i % 5) * 20 + 10)}%`
                }
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

export function IndianThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Tri-color horizontal stripes */}
      <View style={styles.indianFlag}>
        <View style={styles.saffron} />
        <View style={styles.white}>
          {/* Ashoka Chakra in center */}
          <View style={styles.chakraContainer}>
            <View style={styles.chakra}>
              {/* 24 spokes */}
              {[...Array(24)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.spoke,
                    {
                      transform: [
                        { rotate: `${i * 15}deg` }
                      ]
                    }
                  ]}
                />
              ))}
              <View style={styles.chakraCenter} />
            </View>
          </View>
        </View>
        <View style={styles.green} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  // American theme styles
  stripesContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  stripe: {
    flex: 1,
  },
  canton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '40%',
    height: '54%',
    backgroundColor: '#0000FF',
  },
  starField: {
    flex: 1,
    position: 'relative',
  },
  star: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '0deg' }],
  },
  // Indian theme styles
  indianFlag: {
    flex: 1,
    flexDirection: 'column',
  },
  saffron: {
    flex: 1,
    backgroundColor: '#FF9933',
  },
  white: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  green: {
    flex: 1,
    backgroundColor: '#138808',
  },
  chakraContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chakra: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spoke: {
    position: 'absolute',
    width: 2,
    height: 22,
    backgroundColor: '#000080',
    top: '50%',
    left: '50%',
    marginLeft: -1,
    marginTop: -11,
  },
  chakraCenter: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000080',
  },
});
