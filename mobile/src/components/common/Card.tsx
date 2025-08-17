import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ViewProps,
} from 'react-native';
import { useDesignSystem } from '../../contexts/ThemeContext';

export type CardVariant = 'flat' | 'outlined' | 'elevated';
export type CardPadding = 'none' | 'small' | 'medium' | 'large';

export interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  padding = 'medium',
  onPress,
  children,
  style,
  disabled = false,
  ...props
}) => {
  const theme = useDesignSystem();

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'flat':
        return {
          backgroundColor: theme.colors.semantic.surface.background,
          ...theme.elevation[0],
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.semantic.surface.paper,
          borderWidth: 1,
          borderColor: theme.colors.semantic.divider,
          ...theme.elevation[0],
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.semantic.surface.paper,
          ...theme.elevation[2],
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: theme.spacing[2] };
      case 'medium':
        return { padding: theme.spacing[4] };
      case 'large':
        return { padding: theme.spacing[6] };
    }
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      opacity: disabled ? 0.38 : 1,
      ...getVariantStyles(),
      ...getPaddingStyles(),
      ...style,
    },
  });

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? {
    onPress,
    activeOpacity: 0.8,
    disabled,
  } : {};

  return (
    <Container style={styles.card} {...containerProps} {...props}>
      {children}
    </Container>
  );
};

// Additional components for structured content
export interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style, ...props }) => {
  const theme = useDesignSystem();
  
  const styles = StyleSheet.create({
    header: {
      paddingBottom: theme.spacing[3],
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.semantic.divider,
      ...style,
    },
  });

  return (
    <View style={styles.header} {...props}>
      {children}
    </View>
  );
};

export interface CardContentProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style, ...props }) => {
  const theme = useDesignSystem();
  
  const styles = StyleSheet.create({
    content: {
      paddingVertical: theme.spacing[3],
      ...style,
    },
  });

  return (
    <View style={styles.content} {...props}>
      {children}
    </View>
  );
};

export interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style, ...props }) => {
  const theme = useDesignSystem();
  
  const styles = StyleSheet.create({
    footer: {
      paddingTop: theme.spacing[3],
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.semantic.divider,
      ...style,
    },
  });

  return (
    <View style={styles.footer} {...props}>
      {children}
    </View>
  );
};