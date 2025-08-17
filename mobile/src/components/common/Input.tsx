import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDesignSystem } from '../../contexts/ThemeContext';

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  helperText,
  disabled = false,
  secureTextEntry = false,
  keyboardType,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const theme = useDesignSystem();

  const getBorderColor = () => {
    if (error) {
      return theme.colors.semantic.error.main;
    }
    if (isFocused) {
      return theme.colors.semantic.primary.main;
    }
    return theme.colors.semantic.divider;
  };

  const getHelperTextColor = () => {
    if (error) {
      return theme.colors.semantic.error.main;
    }
    return theme.colors.semantic.text.secondary;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing[4],
      ...containerStyle,
    },
    label: {
      ...theme.typography.textStyles.bodySmall,
      color: theme.colors.semantic.text.primary,
      marginBottom: theme.spacing[1],
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isFocused ? 2 : 1,
      borderColor: getBorderColor(),
      borderRadius: theme.borderRadius.md,
      backgroundColor: disabled 
        ? theme.colors.semantic.surface.background 
        : theme.colors.semantic.surface.paper,
      height: theme.sizing.touchTarget.comfortable,
      paddingHorizontal: theme.spacing[3],
      opacity: disabled ? 0.38 : 1,
    },
    input: {
      flex: 1,
      ...theme.typography.textStyles.body,
      color: theme.colors.semantic.text.primary,
      paddingVertical: theme.spacing[2],
      ...inputStyle,
    },
    icon: {
      marginHorizontal: theme.spacing[1],
    },
    helperText: {
      ...theme.typography.textStyles.caption,
      color: getHelperTextColor(),
      marginTop: theme.spacing[1],
      marginLeft: theme.spacing[3],
    },
    rightIconButton: {
      padding: theme.spacing[1],
      marginRight: -theme.spacing[1],
    },
  });

  const iconSize = 20;
  const iconColor = disabled 
    ? theme.colors.semantic.text.disabled 
    : theme.colors.semantic.text.secondary;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={iconSize}
            color={iconColor}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.semantic.text.hint}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            disabled={!onRightIconPress || disabled}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={iconSize}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={styles.helperText}>{error || helperText}</Text>
      )}
    </View>
  );
};