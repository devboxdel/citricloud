import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const colors = useColors();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: 'cloud-outline' as const,
      title: 'Welcome to CitriCloud',
      description: 'Your complete cloud workspace for business productivity and collaboration.',
      color: colors.accent,
    },
    {
      icon: 'briefcase-outline' as const,
      title: 'Workspace Apps',
      description: 'Access email, documents, sheets, drive, and more - all in one place.',
      color: '#10b981',
    },
    {
      icon: 'cart-outline' as const,
      title: 'Shop & Services',
      description: 'Browse our shop for premium plans and discover professional services.',
      color: '#f59e0b',
    },
    {
      icon: 'shield-checkmark-outline' as const,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime guarantee for your business.',
      color: '#8b5cf6',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('hasSeenWelcome', 'true');
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip Button */}
      {currentSlide < slides.length - 1 && (
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
        </Pressable>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: slide.color + '20' }]}>
          <Ionicons name={slide.icon} size={80} color={slide.color} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{slide.title}</Text>

        {/* Description */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {slide.description}
        </Text>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === currentSlide ? colors.accent : colors.border,
                  width: idx === currentSlide ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentSlide > 0 && (
          <Pressable
            style={[styles.backButton, { borderColor: colors.border }]}
            onPress={() => setCurrentSlide(currentSlide - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Back</Text>
          </Pressable>
        )}
        
        <View style={{ flex: 1 }} />
        
        <Pressable
          style={[styles.nextButton, { backgroundColor: colors.accent }]}
          onPress={handleNext}
        >
          <Text style={[styles.nextText, { color: colors.background }]}>
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons
            name={currentSlide === slides.length - 1 ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={colors.background}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 320,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 24,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 140,
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
