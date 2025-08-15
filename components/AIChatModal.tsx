import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Modal, ModalHeader, ModalTitle, ModalContent } from './ui/Modal';
import { Textarea } from './ui/Textarea';
import { Button } from './ui/Button';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon';
import SparklesIcon from './icons/SparklesIcon';
import { cn } from '../lib/utils';
import { useAppContext } from '../contexts/AppContext';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { currentEmployee } = useAppContext();
  const [chat, setChat] = useState<Chat | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoading(true);
      try {
        if (!process.env.API_KEY) {
            throw new Error("API key is not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: "You are Gem, a friendly and knowledgeable AI assistant for the Ordino POS system. Your goal is to help restaurant staff with their questions about the menu, ingredients, promotions, and general operational queries. Be concise and helpful.",
          },
        });
        setChat(chatSession);
        setHistory([{ role: 'model', text: `Hi ${currentEmployee?.name.split(' ')[0] || ''}! I'm Gem. How can I help you today?` }]);
      } catch (e) {
        console.error("Failed to initialize Gemini AI:", e);
        setError("Could not initialize AI Assistant. Please check the API Key configuration.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isOpen, currentEmployee]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const text = userInput.trim();
    setUserInput('');
    setIsLoading(true);
    setError(null);
    setHistory(prev => [...prev, { role: 'user', text }]);
    
    // Add a placeholder for the model's response for streaming
    setHistory(prev => [...prev, { role: 'model', text: '' }]);

    try {
      const result = await chat.sendMessageStream({ message: text });
      
      for await (const chunk of result) {
        const chunkText = chunk.text;
        setHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.role === 'model') {
            lastMessage.text += chunkText;
          }
          return newHistory;
        });
      }

    } catch (e) {
      console.error("Error sending message:", e);
      const errorMessage = "Sorry, I encountered an error. Please try again.";
      setError(errorMessage);
       setHistory(prev => {
        const newHistory = [...prev];
        const lastMessage = newHistory[newHistory.length - 1];
        if (lastMessage && lastMessage.role === 'model') {
          lastMessage.text = errorMessage;
        }
        return newHistory;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl h-[80vh] flex flex-col">
      <style>{`
        .dot-flashing { position: relative; width: 6px; height: 6px; border-radius: 5px; background-color: currentColor; color: currentColor; animation: dot-flashing 1s infinite linear alternate; animation-delay: .5s; }
        .dot-flashing::before, .dot-flashing::after { content: ''; display: inline-block; position: absolute; top: 0; }
        .dot-flashing::before { left: -10px; width: 6px; height: 6px; border-radius: 5px; background-color: currentColor; color: currentColor; animation: dot-flashing 1s infinite alternate; animation-delay: 0s; }
        .dot-flashing::after { left: 10px; width: 6px; height: 6px; border-radius: 5px; background-color: currentColor; color: currentColor; animation: dot-flashing 1s infinite alternate; animation-delay: 1s; }
        @keyframes dot-flashing { 0% { background-color: currentColor; } 50%, 100% { background-color: rgba(156, 163, 175, 0.4); } }
      `}</style>
      <ModalHeader className="flex items-center gap-3">
        <SparklesIcon className="w-6 h-6 text-primary" />
        <ModalTitle>Gem AI Assistant</ModalTitle>
      </ModalHeader>
      <ModalContent className="p-0 flex flex-col flex-grow">
        <div className="flex-grow p-6 space-y-4 overflow-y-auto">
          {history.map((msg, index) => (
            <div key={index} className={cn('flex items-end gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'model' && <SparklesIcon className="w-6 h-6 text-primary shrink-0 mb-1" />}
              <div
                className={cn(
                  'max-w-md p-3 rounded-2xl',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'
                )}
              >
                {msg.text ? <p className="whitespace-pre-wrap">{msg.text}</p> : (isLoading && index === history.length -1) && <div className="dot-flashing" />}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t border-border bg-card mt-auto">
            {error && <p className="text-destructive text-sm mb-2 text-center">{error}</p>}
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                  }
              }}
              placeholder="Ask about menu items, promotions..."
              className="min-h-0 h-12"
              rows={1}
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="h-12 w-12 shrink-0" disabled={isLoading || !userInput.trim()}>
              <PaperAirplaneIcon className="w-6 h-6" />
            </Button>
          </form>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default AIChatModal;