import { useEffect, useRef, useState } from 'react'
import { sendChatMessage } from '../../services/aiService.js'
import './ChatbotPanel.css'

function ChatbotPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hi! I am your AI Asset Assistant. How can I help you?',
        },
    ])
    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages, loading])

    async function handleSubmit(event) {
        event.preventDefault()

        const trimmedMessage = message.trim()

        if (!trimmedMessage || loading) {
            return
        }

        setMessages((currentMessages) => [
            ...currentMessages,
            {
                role: 'user',
                content: trimmedMessage,
            },
        ])

        setMessage('')
        setLoading(true)

        try {
            const response = await sendChatMessage(trimmedMessage)

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    content: response.answer,
                },
            ])
        } catch {
            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    role: 'assistant',
                    content: 'Unable to connect to the AI service right now.',
                },
            ])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {isOpen ? (
                <aside className="chatbot-panel">
                    <div className="chatbot-header">
                        <div className="chatbot-header__identity">
                            <div className="chatbot-avatar">
                                ✦
                            </div>

                            <div>
                                <h2>AI Assistant</h2>

                                <div className="chatbot-status">
                                    <span className="chatbot-status__dot" />
                                    Online
                                </div>
                            </div>
                        </div>

                        <button
                            className="chatbot-close"
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close AI Assistant"
                        >
                            ×
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`chatbot-message chatbot-message--${item.role}`}
                            >
                                <span className="chatbot-message__label">
                                    {item.role === 'user' ? 'You' : 'AI Assistant'}
                                </span>

                                <div className="chatbot-message__content">
                                    {item.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="chatbot-message chatbot-message--assistant">
                                <span className="chatbot-message__label">
                                    AI Assistant
                                </span>

                                <div className="chatbot-thinking">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    <form
                        className="chatbot-form"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Ask..."
                            disabled={loading}
                        />

                        <button
                            type="submit"
                            disabled={loading || !message.trim()}
                            aria-label="Send message"
                        >
                            Send
                        </button>
                    </form>
                </aside>
            ) : (
                <button
                    className="chatbot-launcher"
                    type="button"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open AI Assistant"
                >
                    <span className="chatbot-launcher__icon">✦</span>
                </button>
            )}
        </>
    )
}

export default ChatbotPanel