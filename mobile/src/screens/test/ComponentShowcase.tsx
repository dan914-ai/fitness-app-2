import React, { useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/common/Card';
import { useDesignSystem } from '../../contexts/ThemeContext';

export const ComponentShowcase: React.FC = () => {
  const theme = useDesignSystem();
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [emailValue, setEmailValue] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.semantic.surface.background,
    },
    scrollContent: {
      padding: theme.spacing[4],
    },
    section: {
      marginBottom: theme.spacing[8],
    },
    sectionTitle: {
      ...theme.typography.textStyles.h3,
      color: theme.colors.semantic.text.primary,
      marginBottom: theme.spacing[4],
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[2],
      marginBottom: theme.spacing[2],
    },
    cardRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      ...theme.typography.textStyles.h5,
      color: theme.colors.semantic.text.primary,
    },
    cardSubtitle: {
      ...theme.typography.textStyles.bodySmall,
      color: theme.colors.semantic.text.secondary,
      marginTop: theme.spacing[1],
    },
    cardBody: {
      ...theme.typography.textStyles.body,
      color: theme.colors.semantic.text.primary,
    },
    statValue: {
      ...theme.typography.textStyles.h2,
      color: theme.colors.semantic.primary.main,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Button Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buttons</Text>
          
          <Text style={theme.typography.textStyles.h6}>Variants</Text>
          <View style={styles.row}>
            <Button variant="primary" onPress={() => {}}>Primary</Button>
            <Button variant="secondary" onPress={() => {}}>Secondary</Button>
            <Button variant="tertiary" onPress={() => {}}>Tertiary</Button>
          </View>
          <View style={styles.row}>
            <Button variant="destructive" onPress={() => {}}>Destructive</Button>
            <Button variant="ghost" onPress={() => {}}>Ghost</Button>
          </View>

          <Text style={theme.typography.textStyles.h6}>Sizes</Text>
          <View style={styles.row}>
            <Button size="small" onPress={() => {}}>Small</Button>
            <Button size="medium" onPress={() => {}}>Medium</Button>
            <Button size="large" onPress={() => {}}>Large</Button>
          </View>

          <Text style={theme.typography.textStyles.h6}>With Icons</Text>
          <View style={styles.row}>
            <Button icon="play" onPress={() => {}}>Start Workout</Button>
            <Button icon="check" iconPosition="right" variant="secondary" onPress={() => {}}>
              Complete
            </Button>
          </View>

          <Text style={theme.typography.textStyles.h6}>States</Text>
          <View style={styles.row}>
            <Button disabled onPress={() => {}}>Disabled</Button>
            <Button loading onPress={() => {}}>Loading</Button>
          </View>

          <Text style={theme.typography.textStyles.h6}>Full Width</Text>
          <Button fullWidth onPress={() => {}}>Full Width Button</Button>
        </View>

        {/* Input Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inputs</Text>
          
          <Input
            label="Basic Input"
            placeholder="Enter text..."
            value={inputValue}
            onChangeText={setInputValue}
            helperText="This is helper text"
          />

          <Input
            label="Email"
            placeholder="Enter your email"
            value={emailValue}
            onChangeText={setEmailValue}
            keyboardType="email-address"
            leftIcon="email"
            error={emailValue && !emailValue.includes('@') ? 'Invalid email format' : ''}
          />

          <Input
            label="Password"
            placeholder="Enter password"
            value={passwordValue}
            onChangeText={setPasswordValue}
            secureTextEntry
            leftIcon="lock"
            rightIcon="eye"
            onRightIconPress={() => {}}
            helperText="Must be at least 8 characters"
          />

          <Input
            label="Disabled Input"
            placeholder="Cannot edit"
            value="Disabled content"
            onChangeText={() => {}}
            disabled
          />
        </View>

        {/* Card Examples */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cards</Text>
          
          <Card variant="elevated" style={{ marginBottom: theme.spacing[3] }}>
            <CardContent>
              <Text style={styles.cardTitle}>Elevated Card</Text>
              <Text style={styles.cardSubtitle}>Default card with elevation</Text>
              <Text style={styles.cardBody}>
                This is the content of the card. Cards can contain any content and are great for grouping related information.
              </Text>
            </CardContent>
          </Card>

          <Card variant="outlined" style={{ marginBottom: theme.spacing[3] }}>
            <CardHeader>
              <View style={styles.cardRow}>
                <Text style={styles.cardTitle}>Outlined Card</Text>
                <Button size="small" variant="tertiary" onPress={() => {}}>Action</Button>
              </View>
            </CardHeader>
            <CardContent>
              <Text style={styles.cardBody}>
                This card has a header, content, and footer sections.
              </Text>
            </CardContent>
            <CardFooter>
              <View style={styles.cardRow}>
                <Button variant="ghost" size="small" onPress={() => {}}>Cancel</Button>
                <Button variant="primary" size="small" onPress={() => {}}>Confirm</Button>
              </View>
            </CardFooter>
          </Card>

          <Card variant="flat" padding="large" style={{ marginBottom: theme.spacing[3] }}>
            <Text style={styles.cardTitle}>Flat Card</Text>
            <Text style={styles.cardSubtitle}>No elevation, just background</Text>
          </Card>

          <Card 
            variant="elevated" 
            onPress={() => console.log('Card pressed')}
            style={{ marginBottom: theme.spacing[3] }}
          >
            <CardContent>
              <Text style={styles.cardTitle}>Pressable Card</Text>
              <Text style={styles.cardSubtitle}>Tap to interact</Text>
            </CardContent>
          </Card>

          <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
            <Card variant="elevated" style={{ flex: 1 }}>
              <CardContent>
                <Text style={styles.statValue}>1,234</Text>
                <Text style={styles.cardSubtitle}>Total Reps</Text>
              </CardContent>
            </Card>
            <Card variant="elevated" style={{ flex: 1 }}>
              <CardContent>
                <Text style={styles.statValue}>45m</Text>
                <Text style={styles.cardSubtitle}>Duration</Text>
              </CardContent>
            </Card>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};