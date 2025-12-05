import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppTheme } from '../store/themeStore';

export function ThemedBackground({ theme }: { theme: AppTheme }) {
  switch (theme) {
    case 'american':
      return <AmericanThemedBackground />;
    case 'indian':
      return <IndianThemedBackground />;
    case 'filipino':
      return <FilipinoThemedBackground />;
    case 'chinese':
      return <ChineseThemedBackground />;
    case 'spanish':
      return <SpanishThemedBackground />;
    case 'arabic':
      return <ArabicThemedBackground />;
    default:
      return <AmericanThemedBackground />;
  }
}

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

export function FilipinoThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Filipino flag: horizontal blue and red with white triangle */}
      <View style={styles.filipinoFlag}>
        <View style={styles.filipinoBlue} />
        <View style={styles.filipinoRed} />
        <View style={styles.filipinoTriangle} />
      </View>
    </View>
  );
}

export function ChineseThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Chinese flag: red background with yellow stars */}
      <View style={styles.chineseFlag}>
        <View style={styles.chineseRed} />
        {/* Main star */}
        <View style={[styles.chineseStar, styles.chineseMainStar]} />
        {/* Four smaller stars */}
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.chineseStar, styles.chineseSmallStar, {
            top: 50 + i * 40,
            left: 120
          }]} />
        ))}
      </View>
    </View>
  );
}

export function SpanishThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Spanish flag: horizontal red-yellow-red stripes */}
      <View style={styles.spanishFlag}>
        <View style={styles.spanishRed1} />
        <View style={styles.spanishYellow} />
        <View style={styles.spanishRed2} />
      </View>
    </View>
  );
}

export function ArabicThemedBackground() {
  return (
    <View style={styles.container}>
      {/* Saudi Arabian flag: green background */}
      <View style={styles.arabicFlag}>
        <View style={styles.arabicGreen} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
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
  // Filipino theme styles
  filipinoFlag: {
    flex: 1,
    position: 'relative',
  },
  filipinoBlue: {
    flex: 1,
    backgroundColor: '#0038A8',
  },
  filipinoRed: {
    flex: 1,
    backgroundColor: '#CE1126',
  },
  filipinoTriangle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 150,
    borderTopWidth: 200,
    borderBottomWidth: 200,
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
  },
  // Chinese theme styles
  chineseFlag: {
    flex: 1,
    position: 'relative',
  },
  chineseRed: {
    flex: 1,
    backgroundColor: '#DE2910',
  },
  chineseStar: {
    position: 'absolute',
    width: 30,
    height: 30,
    backgroundColor: '#FFDE00',
  },
  chineseMainStar: {
    top: 40,
    left: 40,
    width: 50,
    height: 50,
  },
  chineseSmallStar: {
    width: 20,
    height: 20,
  },
  // Spanish theme styles
  spanishFlag: {
    flex: 1,
    flexDirection: 'column',
  },
  spanishRed1: {
    flex: 1,
    backgroundColor: '#C60B1E',
  },
  spanishYellow: {
    flex: 2,
    backgroundColor: '#FFC400',
  },
  spanishRed2: {
    flex: 1,
    backgroundColor: '#C60B1E',
  },
  // Arabic theme styles (Saudi Arabia)
  arabicFlag: {
    flex: 1,
  },
  arabicGreen: {
    flex: 1,
    backgroundColor: '#007A3D',
  },
});
