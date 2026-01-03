import { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/colors';

type ScreenProps = {
  children: ReactNode;
};

export function Screen({ children }: ScreenProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        <View style={[
          styles.content,
          { paddingHorizontal: isTablet ? 40 : 20 }
        ]}>
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    paddingVertical: 16,
  }
});
