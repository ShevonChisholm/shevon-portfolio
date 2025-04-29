"use client";

import { Typography } from "@mui/material";
import CodeBlock from "@/components/CodeBlock";

export default function ReactNativeExpo() {
  return (
    <>
      <Typography variant="h2">
        Getting Started with React Native and Expo
      </Typography>
      <Typography>
        React Native with Expo provides a powerful way to build cross-platform
        mobile applications. This guide covers the essential steps to get
        started with your first React Native project using Expo.
      </Typography>

      <Typography variant="h2">
        Setting Up Your Development Environment
      </Typography>
      <CodeBlock language="bash">
        {`npx create-expo-app my-app
cd my-app
npx expo start`}
      </CodeBlock>

      <Typography variant="h2">Basic App Structure</Typography>
      <CodeBlock language="typescript">
        {`import { StyleSheet, View, Text } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Welcome to React Native!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});`}
      </CodeBlock>

      <Typography variant="h2">Adding Navigation</Typography>
      <Typography>
        Use React Navigation to handle screen transitions in your Expo app.
      </Typography>
      <CodeBlock language="bash">
        {`npm install @react-navigation/native
npm install @react-navigation/stack
expo install react-native-screens react-native-safe-area-context`}
      </CodeBlock>
      <CodeBlock language="typescript">
        {`// App.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}`}
      </CodeBlock>

      <Typography variant="h2">Using Expo APIs</Typography>
      <Typography>
        Expo provides many built-in APIs for camera, image picker, sensors, and
        more.
      </Typography>
      <CodeBlock language="bash">
        {`expo install expo-image-picker
expo install expo-location`}
      </CodeBlock>
      <CodeBlock language="typescript">
        {`import * as ImagePicker from 'expo-image-picker';
import { Button, Image } from 'react-native';
import React from 'react';

export default function ImagePickerExample() {
  const [image, setImage] = React.useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.cancelled) setImage(result.uri);
  };

  return (
    <>
      <Button title="Pick an image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
    </>
  );
}`}
      </CodeBlock>

      <Typography variant="h2">Styling and Theming</Typography>
      <Typography>
        Leverage styled-components or native StyleSheet for consistent styling.
      </Typography>
      <CodeBlock language="typescript">
        {`import styled from 'styled-components/native';

const Container = styled.View` +
          "`" +
          `
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
` +
          "`" +
          `;

const Title = styled.Text` +
          "`" +
          `
  font-size: 24px;
  font-weight: bold;
  color: #333;
` +
          "`" +
          `;

export default function StyledScreen() {
  return (
    <Container>
      <Title>Styled with styled-components</Title>
    </Container>
  );
}`}
      </CodeBlock>

      <Typography variant="h2">Building and Deployment</Typography>
      <Typography>
        Use Expo&apos;s build service or EAS to create standalone binaries for
        iOS and Android.
      </Typography>
      <CodeBlock language="bash">
        {`expo build:android
expo build:ios
# Or EAS builds
eas build --platform all`}
      </CodeBlock>

      <Typography variant="h2">Over-the-Air Updates</Typography>
      <Typography>
        Implement OTA updates using expo-updates to push JS changes without app
        store submissions.
      </Typography>
      <CodeBlock language="bash">{`expo install expo-updates`}</CodeBlock>
      <CodeBlock language="typescript">
        {`import * as Updates from 'expo-updates';

async function checkForUpdates() {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();
    Updates.reloadAsync();
  }
}

checkForUpdates();`}
      </CodeBlock>

      <Typography variant="h2">Testing and Debugging</Typography>
      <Typography>
        Use Jest and React Native Testing Library for unit tests, and Expo
        DevTools or Reactotron for debugging.
      </Typography>
      <CodeBlock language="bash">
        {`npm install --dev jest @testing-library/react-native`}
      </CodeBlock>
      <CodeBlock language="typescript">
        {`import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

test('renders welcome message', () => {
  const { getByText } = render(<App />);
  expect(getByText(/Welcome to React Native!/i)).toBeTruthy();
});`}
      </CodeBlock>
    </>
  );
}
