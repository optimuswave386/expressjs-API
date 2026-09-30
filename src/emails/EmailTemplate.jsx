// EmailTemplate.jsx
import * as React from 'react';
import { Html, Button, Text, Container } from '@react-email/components';

export default function EmailTemplate({ name, message }) {
  return (
    <Html lang="en">
      <Container>
        <Text>Hello, my name is **{name}**.</Text>
        <Text>{message}</Text>
      </Container>
    </Html>
  );
}