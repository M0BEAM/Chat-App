import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Replace with your server URL

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [username, setUsername] = useState<string | null>(null); // State for username
  const [inputUsername, setInputUsername] = useState('');

  useEffect(() => {
    // Fetch previous messages when the component mounts
    socket.emit('getPreviousMessages');

    socket.on('previousMessages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });

    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('previousMessages');
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage && username) {
      const messageToSend = { content: inputMessage, sender: username };
      socket.emit('message', messageToSend); // Send both content and sender
      setInputMessage('');
    }
  };

  // Set username when the user submits
  const setUsernameHandler = () => {
    if (inputUsername) {
      setUsername(inputUsername);
    }
  };

  if (!username) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-lg font-bold mb-4">Enter your name</h1>
        <input
          type="text"
          value={inputUsername}
          onChange={(e) => setInputUsername(e.target.value)}
          placeholder="Your name"
          className="border px-4 py-2 rounded-lg"
        />
        <button
          onClick={setUsernameHandler}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
        <h1 className="text-lg font-bold">Messenger</h1>
        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className={`my-2 ${message.sender === username ? 'self-end' : 'self-start'}`}>
            <div className={`p-3 rounded-lg ${message.sender === username ? 'bg-blue-600 text-white' : 'bg-gray-300 text-black'}`}>
              <p>{message.content}</p>
              {/* Show the sender */}
              <small className={`block text-xs ${message.sender === username ? 'text-gray-200' : 'text-gray-500'}`}>
              {message.sender}
              </small>
              <small className={`block text-xs ${message.sender === username ? 'text-gray-200' : 'text-gray-500'}`}>
                {new Date(message.created_at).toLocaleString()}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Input Container */}
      <div className="flex p-4 bg-white border-t">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
