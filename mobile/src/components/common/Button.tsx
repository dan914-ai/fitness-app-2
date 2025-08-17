import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDesignSystem } from '../../contexts/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  children: string;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onPress,
  children,
  style,
  ...props
}) => {
  const theme = useDesignSystem();
  
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.semantic.primary.main,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.semantic.primary.main,
        };
      case 'tertiary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'destructive':
        return {
          backgroundColor: theme.colors.semantic.error.main,
          borderWidth: 0,
        };
      case 'ghost':
        return {
          backgroundColor: theme.colors.semantic.surface.paper,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) {
      return theme.colors.semantic.text.disabled;
    }
    
    switch (variant) {
      case 'primary':
      case 'destructive':
        return theme.colors.semantic.text.inverse;
      case 'secondary':
        return theme.colors.semantic.primary.main;
      case 'tertiary':
        return theme.colors.semantic.primary.main;
      case 'ghost':
        return theme.colors.semantic.text.primary;
      default:
        return theme.colors.semantic.text.primary;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          height: theme.sizing.button.small,
          paddingHorizontal: theme.spacing[3],
        };
      case 'medium':
        return {
          height: theme.sizing.button.medium,
          paddingHorizontal: theme.spacing[4],
        };
      case 'large':
        return {
          height: theme.sizing.button.large,
          paddingHorizontal: theme.spacing[5],
        };
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle = theme.typography.textStyles.button;
    const sizeStyle = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
    }[size];

    return {
      ...baseStyle,
      ...sizeStyle,
      color: getTextColor(),
    };
  };

  const iconSize = {
    small: 16,
    medium: 20,
    large: 24,
  }[size];

  const iconColor = getTextColor();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.lg,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.38 : 1,
      ...getVariantStyles(),
      ...getSizeStyles(),
      ...style,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: getTextStyles(),
    iconLeft: {
      marginRight: theme.spacing[2],
    },
    iconRight: {
      marginLeft: theme.spacing[2],
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={iconColor} size={size === 'small' ? 'small' : 'small'} />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.iconLeft}
              />
            )}
            <Text style={styles.text}>{children}</Text>
            {icon && iconPosition === 'right' && (
              <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={iconColor}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};