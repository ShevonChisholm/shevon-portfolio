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
    </>
  );
}
