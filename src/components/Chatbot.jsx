import { useState } from 'react';
import { MessageCircle, SendHorizonal, X } from 'lucide-react';

function Chatbot({ prompts, onPrompt }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ask me things like "Is this medicine safe?" or "Explain this risk".',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const submitMessage = async (message) => {
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      return;
    }

    setMessages((current) => [...current, { role: 'user', content: cleanMessage }]);
    setInput('');
    setIsSending(true);

    try {
      const reply = await onPrompt(cleanMessage);
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: error.message || 'The assistant is temporarily unavailable.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chatbot-shell">
      {isOpen && (
        <div className="chatbot-panel glass-card">
          <div className="chatbot-header">
            <div>
              <strong>MedSentinel Assistant</strong>
              <span>Quick safety guidance</span>
            </div>
            <button className="icon-button" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X size={16} />
            </button>
          </div>

          <div className="chatbot-prompts">
            {prompts.map((prompt) => (
              <button key={prompt} className="prompt-chip" onClick={() => submitMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isSending && <div className="chat-message assistant">Thinking...</div>}
          </div>

          <div className="chatbot-input-row">
            <input
              className="text-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about safety or risks"
            />
            <button className="icon-button primary" onClick={() => submitMessage(input)} aria-label="Send">
              <SendHorizonal size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="chatbot-trigger">
        <span className="chatbot-tooltip">Ask AI Assistant</span>
        <button className="chatbot-fab" onClick={() => setIsOpen((current) => !current)}>
          <MessageCircle size={18} />
          Assistant
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
