'use client';
import { FC, useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface MessageInputProps {
  onSend: (text: string) => void;
}

const MessageInput: FC<MessageInputProps> = ({ onSend }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 9 * 24)}px`; // Máx 9 linhas
    }
  }, [text]);

  return (
    <div className="bg-gray-100 p-3">
      <div className="flex items-end bg-white border border-gray-300 rounded-full px-3 py-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Digite sua mensagem..."
          className="flex-1 resize-none overflow-hidden text-sm bg-transparent focus:outline-none leading-relaxed min-h-[32px] pt-[6px] pb-[6px]"
          style={{
            maxHeight: '216px',
          }}
        />
        <button
          onClick={handleSend}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full ml-2 flex items-center justify-center"
        >
          <FaPaperPlane size={14} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
