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
  const [message, setMessage] = useState(''); // Moved this above to be consistent with state declaration
  const sendMessage = async () => {
    setMessage('')
    setMessages((messages) => [...messages, { role: 'user', content: message }])

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
        body: JSON.stringify([...messages, { role: 'user', content: message }]), // Send updated messages
      }).then((res) => {
      const reader = res.body.getReader ()
      const decoder = new TextDecoder()
      let result = ''
      return reader.read().then(function processText ({done, value}) {
        if (done) {
          return result
        }
        const text = decoder.decode(value || new Uint8Array(), {stream: true})
        setMessages((messages) => {
          // Ensure there's at least one message before accessing lastMessage
          if (messages.length === 0) return messages;
    
          let lastMessage = messages[messages.length - 1];
    
          // Check if lastMessage is from the assistant; if not, add a new one
          if (lastMessage.role !== 'assistant') {
            lastMessage = { role: 'assistant', content: '' };
            messages = [...messages, lastMessage];
          }
    
          let otherMessages = messages.slice(0, messages.length - 1);
          
          // Safely update the content of the last message
          return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
        });
        return reader.read().then(processText)
      })
    })
  }

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
      // Use column direction for header and content

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