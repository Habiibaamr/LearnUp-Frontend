import { useEffect, useMemo, useState } from "react";
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
import {
  getChatMessages,
  listChatSessions,
  sendChatMessage,
  startChatSession,
} from "../../../services/chatbot.js";
import "./academicAdvisorBot.css";

const chips = [
  "Explain registration rules",
  "How can I improve my academic performance?",
  "What should I do if I am struggling in a course?",
  "Explain grade posting policies",
  "Give me study tips for this semester",
  "Explain K-means clustering",
];
const AI_NOT_CONFIGURED_MESSAGE =
  "Learnbot is currently unavailable. Please try again later.";

const initialMessages = [
  {
    id: "welcome",
    sender: "bot",
    meta: "Learnbot",
    text: "Hello! I can help with academic advising, registration rules, policies, and study guidance. What would you like to know?",
  },
];

function BotAvatar() {
  return <span className="advisor-bot-avatar"><Bot size={17} strokeWidth={2.5} /></span>;
}

function UserAvatar() {
  return <span className="advisor-user-avatar" aria-label="Student" role="img" />;
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
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loadingReply, setLoadingReply] = useState(false);
  const [chatError, setChatError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      try {
        const chatSessions = await listChatSessions();
        if (!isMounted) return;

        setSessions(chatSessions);
        const latestSessionId = chatSessions.at(-1)?.session_id;

        if (latestSessionId) {
          const storedMessages = await getChatMessages(latestSessionId);
          if (isMounted) {
            setActiveSessionId(latestSessionId);
            if (storedMessages.length) {
              setMessages(storedMessages);
            }
          }
        }
      } catch {
        if (isMounted) {
          setChatError("Chat history is temporarily unavailable. You can still start a new message.");
        }
      }
    }

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const sessionsWithLabels = useMemo(
    () => sessions.map((session, index) => ({
      ...session,
      displayLabel: `Chat ${index + 1}`,
    })),
    [sessions],
  );

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessionsWithLabels.filter((session) => (
      !query ||
      session.displayLabel.toLowerCase().includes(query) ||
      String(session.started_at || "").toLowerCase().includes(query)
    ));
  }, [search, sessionsWithLabels]);

  const openSession = async (sessionId) => {
    try {
      setChatError("");
      const storedMessages = await getChatMessages(sessionId);
      setActiveSessionId(sessionId);
      setMessages(storedMessages.length ? storedMessages : initialMessages);
    } catch {
      setChatError("This conversation could not be loaded right now.");
    }
  };

  const createNewChat = async () => {
    try {
      setChatError("");
      const sessionId = await startChatSession();
      setActiveSessionId(sessionId);
      setSessions((current) => [
        ...current,
        { session_id: sessionId, started_at: new Date().toISOString() },
      ]);
      setMessages(initialMessages);
    } catch {
      setActiveSessionId(null);
      setMessages(initialMessages);
      setChatError("Learnbot is temporarily offline. Your dashboard and login are not affected.");
    }
  };

  const sendMessageToBot = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loadingReply) return;

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, sender: "user", meta: "You • now", text: trimmed },
    ]);
    setInput("");
    setChatError("");
    setLoadingReply(true);

    try {
      let sessionId = activeSessionId;

      if (!sessionId) {
        sessionId = await startChatSession();
        setActiveSessionId(sessionId);
        setSessions((current) => [
          ...current,
          { session_id: sessionId, started_at: new Date().toISOString() },
        ]);
      }

      const response = await sendChatMessage(sessionId, trimmed);
      setActiveSessionId(response.sessionId);
      setMessages((current) => [
        ...current,
        {
          ...response.assistantMessage,
          meta: "Learnbot • now",
          text: response.assistantMessage.text || AI_NOT_CONFIGURED_MESSAGE,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `fallback-${Date.now()}`,
          sender: "bot",
          meta: "Learnbot • now",
          text: AI_NOT_CONFIGURED_MESSAGE,
        },
      ]);
      setChatError("Learnbot is currently unavailable. Please try again later.");
    } finally {
      setLoadingReply(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessageToBot(input);
  };

  return (
    <div className="advisor-bot-page">
      <StudentSidebar />

      <aside className="advisor-history">
        <header>
          <h1>History</h1>
          <button type="button" aria-label="New chat" onClick={createNewChat}><SquarePlus size={22} /></button>
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
          <section>
            <h2>Recent Conversations</h2>
            {filteredSessions.map((session) => (
              <button
                key={session.session_id}
                type="button"
                className={activeSessionId === session.session_id ? "is-active" : ""}
                onClick={() => openSession(session.session_id)}
              >
                <strong>{session.displayLabel}</strong>
                <span>{session.started_at ? new Date(session.started_at).toLocaleDateString() : "Recent"}</span>
              </button>
            ))}
            {!filteredSessions.length && <span>No saved conversations yet.</span>}
          </section>
        </div>

        <button
          type="button"
          className="advisor-history__clear"
          onClick={() => {
            setActiveSessionId(null);
            setMessages(initialMessages);
          }}
        >
          Clear Current Chat
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
            <button key={chip} type="button" onClick={() => sendMessageToBot(chip)}>
              {chip}
            </button>
          ))}
        </div>

        <main className="advisor-chat__messages">
          {messages.map((message) => <Message key={message.id} message={message} />)}
          {loadingReply && (
            <div className="advisor-typing">
              <BotAvatar />
              <span><i /><i /><i /></span>
            </div>
          )}
        </main>

        {chatError && <p className="advisor-disclaimer" role="status">{chatError}</p>}

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
          <button type="submit" aria-label="Send" disabled={loadingReply}>
            <SendHorizontal size={23} />
          </button>
        </form>

        <p className="advisor-disclaimer">Learnbot AI may occasionally provide inaccurate information. Verify critical facts.</p>
      </section>
    </div>
  );
}
