import React from 'react';
import './ChatSidebar.css';


const ChatSidebar = ({ chats, activeChatId, onSelectChat, onNewChat, open, user, onLogout }) => {


  
  return (
    <aside className={"chat-sidebar " + (open ? 'open' : '')} aria-label="Previous chats">
      <div className="sidebar-header">
        <h2>Chats</h2>
        <button className="small-btn" onClick={onNewChat}>New</button>
      </div>
      <nav className="chat-list" aria-live="polite">
        {chats.map(c => (
          <button
            key={c._id}
            className={"chat-list-item " + (c._id === activeChatId ? 'active' : '')}
            onClick={() => onSelectChat(c._id)}
          >
            <span className="title-line">{c.title}</span>
          </button>
        ))}
        {chats.length === 0 && <p className="empty-hint">No chats yet.</p>}
      </nav>
      <div className="sidebar-profile">
        <div className="avatar" aria-hidden="true"></div>
        <div className="meta">
          <div style={{fontWeight:600}}>{user ? `${user.fullname.firstName} ${user.fullname.lastName}` : 'Guest'}</div>
          <div style={{fontSize:'0.85rem', color:'#9a9a9a'}}>{user ? user.email : 'Not signed in'}</div>
        </div>
        {user ? (
          <button className="small-btn" onClick={onLogout} style={{marginLeft:'auto'}}>Logout</button>
        ) : (
          <button className="small-btn" onClick={onNewChat} style={{marginLeft:'auto'}}>Login</button>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
