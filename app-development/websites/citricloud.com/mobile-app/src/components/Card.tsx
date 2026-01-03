import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, useWindowDimensions, Platform } from 'react-native';
import { useColors } from '../theme/colors';

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  
  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card, 
          borderColor: colors.border,
          padding: isTablet ? 20 : 16,
          // Remove shadow on Android
          shadowOpacity: Platform.OS === 'android' ? 0 : 0.08,
          elevation: Platform.OS === 'android' ? 0 : 3,
        }, 
        style
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  }
});
