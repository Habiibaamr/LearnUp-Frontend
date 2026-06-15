import { useState } from "react";
import {
  Bot,
  Image,
  Mic,
  MoreVertical,
  Paperclip,
  Search,
  SendHorizontal,
  Share2,
  SquarePlus,
  Trash2,
} from "lucide-react";
import StudentSidebar from "../../../components/student/StudentSidebar.jsx";
import "./academicAdvisorBot.css";

// Mock chat history/messages stay in place until authenticated chat endpoints are wired.
const history = [
  {
    title: "Today",
    items: [
      { title: "K-means Clustering Basics", meta: '"Explain the distance formula..."', active: true },
      { title: "Calculus HW Help", meta: "10:45 AM" },
    ],
  },
  {
    title: "Yesterday",
    items: [
      { title: "Linear Algebra Recap", meta: "Yesterday, 04:20 PM" },
      { title: "Study Schedule Generator", meta: "Yesterday, 09:12 AM" },
    ],
  },
  {
    title: "Last 7 Days",
    items: [
      { title: "Python Library Pandas", meta: "Oct 24, 2023" },
      { title: "Art History Essay Outline", meta: "Oct 22, 2023" },
    ],
  },
];

const chips = ["When is my next quiz?", "Explain K-means clustering", "Show my grades", "Help with Calculus"];

const initialMessages = [
  {
    id: 1,
    sender: "bot",
    meta: "Learnbot • 10:48 AM",
    text: "Hello Alex! I've analyzed your upcoming assignments. You have a quiz on Machine Learning Algorithms this Thursday at 2:00 PM. Would you like to start a practice session or review specific concepts like K-means clustering?",
  },
  {
    id: 2,
    sender: "user",
    meta: "You • 10:49 AM",
    text: "Yes, please. Can you explain K-means clustering in simple terms? I'm specifically struggling with how the 'K' is initially chosen.",
  },
  {
    id: 3,
    sender: "bot",
    meta: "Learnbot • 10:50 AM",
    text: "Great question! Think of K-means clustering like trying to group people at a party into 'K' different conversation circles.\n\nChoosing 'K' is often the trickiest part. Here are the most common ways we do it:\n\nWe test different values and look for the 'bend' in a graph.\n\nSometimes we already know how many groups we need (e.g., T-shirt sizes: S, M, L).\n\nDomain Knowledge:\n\nA mathematical way to see how well each point fits in its group.",
  },
];

function BotAvatar() {
  return <span className="advisor-bot-avatar"><Bot size={17} strokeWidth={2.5} /></span>;
}

function UserAvatar() {
  return <span className="advisor-user-avatar" aria-label="Alex Rivera" role="img" />;
}

function Message({ message }) {
  const isUser = message.sender === "user";
  return (
    <article className={`advisor-message ${isUser ? "is-user" : "is-bot"}`}>
      {!isUser && <BotAvatar />}
      <div className="advisor-message__content">
        <div className="advisor-message__bubble">
          {message.text.split("\n").map((line, index) => <p key={`${message.id}-${index}`}>{line}</p>)}
        </div>
        <span>{message.meta}</span>
      </div>
      {isUser && <UserAvatar />}
    </article>
  );
}

export default function AcademicAdvisorBot() {
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { id: Date.now(), sender: "user", meta: "You • now", text: trimmed },
    ]);
    setInput("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="advisor-bot-page">
      <StudentSidebar />

      <aside className="advisor-history">
        <header>
          <h1>History</h1>
          <button type="button" aria-label="New chat"><SquarePlus size={22} /></button>
        </header>

        <label className="advisor-history__search">
          <Search size={17} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
          />
        </label>

        <div className="advisor-history__list">
          {history.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.items.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  className={item.active ? "is-active" : ""}
                >
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </button>
              ))}
            </section>
          ))}
        </div>

        <button type="button" className="advisor-history__clear" onClick={() => setMessages([])}>
          Clear Chat History
          <Trash2 size={16} />
        </button>
      </aside>

      <section className="advisor-chat" aria-label="Learnbot chat">
        <header className="advisor-chat__header">
          <div>
            <BotAvatar />
            <h2><span>Ask</span><span>Learnbot</span></h2>
          </div>
          <nav aria-label="Chat actions">
            <button type="button" aria-label="Share"><Share2 size={18} /></button>
            <button type="button" aria-label="More"><MoreVertical size={20} /></button>
          </nav>
        </header>

        <div className="advisor-chat__chips">
          {chips.map((chip) => (
            <button key={chip} type="button" onClick={() => sendMessage(chip)}>
              {chip}
            </button>
          ))}
        </div>

        <main className="advisor-chat__messages">
          {messages.map((message) => <Message key={message.id} message={message} />)}
          {messages.length > 0 && (
            <div className="advisor-typing">
              <BotAvatar />
              <span><i /><i /><i /></span>
            </div>
          )}
        </main>

        <form className="advisor-composer" onSubmit={handleSubmit}>
          <div>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your question here..."
            />
            <footer>
              <span>
                <button type="button" aria-label="Attach file"><Paperclip size={15} /></button>
                <button type="button" aria-label="Attach image"><Image size={15} /></button>
                <button type="button" aria-label="Use microphone"><Mic size={15} /></button>
              </span>
              <small>Press Enter to send</small>
            </footer>
          </div>
          <button type="submit" aria-label="Send">
            <SendHorizontal size={23} />
          </button>
        </form>

        <p className="advisor-disclaimer">Learnbot AI may occasionally provide inaccurate information. Verify critical facts.</p>
      </section>
    </div>
  );
}
