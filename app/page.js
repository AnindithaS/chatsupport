"use client";
import { useState } from "react"
import { Box, Stack, TextField, Button } from '@mui/material'
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Clock from './clock.js'; // Adjust the import path based on your file structure

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the Headstarter support assistant. How can I help you today?" }
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Declare isLoading

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setMessage(''); // Clear the input field

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // If streaming response, use the following:
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });

        // Update message content as the response streams
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior (e.g., form submission if inside a form)
      sendMessage();
    }
  };

  const renderers = {
    strong: ({ children }) => <strong style={{ color: 'black', fontFamily: 'CopperPlate', fontSize: '20px'}}>{children}</strong>,
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column" 
      flexGrow={1}
      justifyContent="center"
      alignItems="center"
    >
      <header className="header">
        Headstarter AI Support
      </header>

      <Box
        width="500px"
        height="700px"
        display="flex"
        flexDirection="column"
        border={1}
        borderColor="grey.300"
        p={2}
        bgcolor="background.paper"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={msg.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Box
                bgcolor={msg.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                color="white"
                borderRadius={5}
                p={2}
                maxWidth="75%"
              >
                <ReactMarkdown components={renderers}>{msg.content}</ReactMarkdown>
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          mt={2}
          alignItems="center"
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown} 
            variant="outlined"
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
      </Box>
      <Clock/>
    </Box>
  );
}
