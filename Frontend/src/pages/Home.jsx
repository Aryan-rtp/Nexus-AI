import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { fakeAIReply } from '../components/chat/aiClient.js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  addUserMessage,
  addAIMessage,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
  const [ socket, setSocket ] = useState(null);
  const [ currentUser, setCurrentUser ] = useState(null);
  const navigate = useNavigate();

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // keep latest activeChatId in a ref so socket handler can access up-to-date value
  const activeChatIdRef = React.useRef(activeChatId);
  useEffect(() => { activeChatIdRef.current = activeChatId; }, [activeChatId]);

  const [ messages, setMessages ] = useState([
    // {
    //   type: 'user',
    //   content: 'Hello, how can I help you today?'
    // },
    // {
    //   type: 'ai',
    //   content: 'Hi there! I need assistance with my account.'
    // }
  ]);

  const handleNewChat = async () => {
    // Prompt user for title of new chat, fallback to 'New Chat'
    let title = window.prompt('Enter a title for the new chat:', '');
    if (title) title = title.trim();
    if (!title) return

    const response = await axios.post("http://localhost:3000/Api/Chat/", {
      title
    }, {
      withCredentials: true
    })
    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);
  }

  // Ensure at least one chat exists initially
  useEffect(() => {

    // check auth and fetch chats
    axios.get("http://localhost:3000/Api/Auth/check", { withCredentials: true })
      .then(res => {
        if (res.data && res.data.data) {
          setCurrentUser(res.data.data);
        } else {
          navigate('/login');
        }
      }).catch(() => {
        navigate('/login');
      });

    axios.get("http://localhost:3000/Api/Chat", { withCredentials: true })
      .then(response => {
        dispatch(setChats(response.data.chats.reverse()));
      })

    const tempSocket = io("http://localhost:3000", {
      withCredentials: true,
    })

    tempSocket.on("AI-MESSAGE", (messagePayload) => {
      console.log("Received AI response:", messagePayload);

      // backend emits a plain string (response text), but sometimes payload may be an object
      const text = typeof messagePayload === 'string'
        ? messagePayload
        : (messagePayload && (messagePayload.content || messagePayload.text)) || '';

      if (text && String(text).trim() !== '') {
        setMessages((prevMessages) => [ ...prevMessages, {
          type: 'ai',
          content: String(text)
        } ]);
      }

      dispatch(sendingFinished());
    });

    setSocket(tempSocket);

  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/Api/Auth/logout', {}, { withCredentials: true });
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    navigate('/login');
  }

  const sendMessage = async () => {

    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [ ...messages, {
      type: 'user',
      content: trimmed
    } ];

    console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("message", {
      chat: activeChatId,
      content: trimmed
    })

    // try {
    //   const reply = await fakeAIReply(trimmed);
    //   dispatch(addAIMessage(activeChatId, reply));
    // } catch {
    //   dispatch(addAIMessage(activeChatId, 'Error fetching AI response.', true));
    // } finally {
    //   dispatch(sendingFinished());
    // }
  }

  const getMessages = async (chatId) => {

   const response = await  axios.get(`http://localhost:3000/Api/Chat/messages/${chatId}`, { withCredentials: true })

   console.log("Fetched messages:", response.data.messages);

   setMessages(response.data.messages.map(m => ({
     type: m.role === 'user' ? 'user' : 'ai',
     content: m.content
   })));

  }


return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
      onNewChat={handleNewChat}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        dispatch(selectChat(id));
        setSidebarOpen(false);
        getMessages(id);
      }}
      onNewChat={handleNewChat}
      open={sidebarOpen}
      user={currentUser}
      onLogout={handleLogout}
    />
    <main className="chat-main" role="main">
      {messages.length === 0 && (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1 style={{fontSize:'3rem', marginBottom:8}}>Nexus AI</h1>
          <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
          <div className="hero-cards" aria-hidden="true">
            <div className="hero-card">
              <h3>Code a website</h3>
              <p>Build modern React components with Tailwind CSS integration.</p>
            </div>
            <div className="hero-card">
              <h3>Write a poem</h3>
              <p>Create evocative verses about cosmic mysteries and space exploration.</p>
            </div>
            <div className="hero-card">
              <h3>Explain Physics</h3>
              <p>Break down complex quantum theories into simple, digestible concepts.</p>
            </div>
          </div>
        </div>
      )}
      <ChatMessages messages={messages} isSending={isSending} />
      {
        activeChatId &&
        <ChatComposer
          input={input}
          setInput={(v) => dispatch(setInput(v))}
          onSend={sendMessage}
          isSending={isSending}
        />}
    </main>
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Home;
