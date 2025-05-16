import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const HelpModal = ({ onClose }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [showChatMessage, setShowChatMessage] = useState(false);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const toggleChatMessage = () => {
    setShowChatMessage(!showChatMessage);
  };

  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add to cart, and proceed to checkout.',
    },
    {
      question: 'What are the Delivery options?',
      answer: 'We offer standard and express Deliveries across Kenya.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Use the tracking link provided in your order confirmation email.',
    },
    {
      question: 'What is the return policy?',
      answer: 'Returns are accepted within 30 days for unused items in original packaging.',
    },
    {
      question: 'How do I contact support?',
      answer: 'Email us at support@smartechglobal.co.ke or call +254 792006514.',
    },
  ];

  return (
    <div className="virtual-assistant-popup">
      <button className="close-popup" onClick={onClose}>
        ×
      </button>
      <div className="popup-header">
        <img src="/logo.png" alt="SMARTECH SALES Logo" className="popup-logo" />
        <h3>How can I help you?</h3>
      </div>
      <div className="faq-container">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <div
              className={`faq-question ${expandedFAQ === index ? 'expanded' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <FaChevronDown />
            </div>
            {expandedFAQ === index && (
              <div className="faq-answer">{faq.answer}</div>
            )}
          </div>
        ))}
      </div>
      <div className="live-chat-container">
        <button className="live-chat-button" onClick={toggleChatMessage}>
          Start Live Chat
        </button>
        {showChatMessage && (
          <p className="chat-coming-soon">
            We're sorry, the Virtual Assitance is coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default HelpModal;