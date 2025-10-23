import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);


  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const welcomeMessage = "🤖 Bot: Ciao! Come posso aiutarti oggi?";

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ text: welcomeMessage, sender: 'bot', isWelcome: true }]);
    }
  }, [messages]);

  // efeito scroll 
  useEffect(() => {
    const timeout = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    return () => clearTimeout(timeout);
  }, [messages]);

  // Efeito para Redimensionamento Automático do Textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [userInput]);

  // função para lidar com o envio da mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const question = userInput.trim();
    if (!question || isLoading) return;

    // adicionar a mensagem do usuário ao histórico
    const newUserMessage = { text: question, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    // reseta a altura do textarea após o envio
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // preparar e enviar o payload para a api 
    try {
      const payload = {
        question: question,
        session_id: sessionId
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const { answer, session_id } = data;

      // atualizar o id da sessão e adiciona a resposta do bot
      setSessionId(session_id);
      const newBotMessage = { text: `🤖 Bot: ${answer}`, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, newBotMessage]);

    } catch (error) {
      console.error("erro nella chiamata api:", error);
      const errorMessage = { text: "🤖 Bot: Spiacenti, si è verificato un errore durante la comunicazione con il server.", sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // função para renderizar as mensagens
  const renderMessage = (message, index) => {
    const isUser = message.sender === 'user';

    let bubbleClasses = 'max-w-[75%] p-3 rounded-xl break-words whitespace-pre-wrap';
    let textStyle = {};

    if (message.isWelcome) {
      bubbleClasses = 'self-start p-0';
      textStyle = { color: '#00BFFF', fontWeight: 'bold' };
    } else if (isUser) {
      bubbleClasses += ' self-end bg-[#364140] text-white';
    } else {
      bubbleClasses = 'self-start p-0 text-white';
    }

    return (
      <div key={index} className="flex flex-col">
        <p className={bubbleClasses} style={textStyle}>
          {message.text}
        </p>
      </div>
    );
  };

  return (
    <div className="bg-[#1B1C1D] h-screen flex flex-col">
      <header className='flex justify-between p-6 bg-[#1B1C1D] text-white fixed top-0 w-full z-10'>
        <h1 className='text-xl font-bold'>CHATINHO INFO</h1>
        <p><FontAwesomeIcon icon={faUser} className="w-5 h-5 text-white" /></p>
      </header>

      <main className="pt-24 pb-24 flex justify-center h-[calc(100vh-180px)] overflow-y-auto chat-scroll">
        <div className='w-full max-w-3xl h-full mx-4 bg-[#1B1C1D] p-6 rounded-lg flex flex-col'>
          <div id="messages" className='flex flex-col space-y-4'>
            {messages.map(renderMessage)}

            {isLoading && (
              <p className="self-start text-white opacity-70">
                🤖 Bot: ...digitando...
              </p>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <footer className='fixed bottom-0 w-full p-4 bg-[#1B1C1D] border-t border-gray-700 flex justify-center z-10'>
        <form onSubmit={handleSendMessage} className='flex w-full max-w-3xl'>
          <div className='relative flex-1'>
            <textarea
              ref={textareaRef}
              rows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi qui il tuo messaggio..."
              className="w-full p-3 rounded-lg border-none focus:outline-none bg-gray-600 text-white resize-none max-h-40 pr-12"
              disabled={isLoading}
            />

            {userInput.length > 0 && (
              <button
                type="submit"
                className={`absolute bottom-2 right-2 p-2 rounded-full h-fit transition-colors duration-200 
                                    bg-[#364153]
                                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}`}
                disabled={isLoading}
              >
                <FontAwesomeIcon
                  icon={faPaperPlane}
                  className="w-5 h-5 text-gray-300"
                />
              </button>
            )}
          </div>
        </form>
      </footer>
    </div>
  );
}

export default App;