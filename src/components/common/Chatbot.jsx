import React from 'react';
import useChatbot from '../../hooks/useChatbot';

/**
 * Chatbot Component - Integrates the SaaS Chatbot into your application
 * 
 * Usage:
 * <Chatbot 
 *   apiKey="your-api-key"
 *   chatbotId="your-chatbot-id"
 *   primaryColor="#3B82F6"
 * />
 */
const Chatbot = ({
    apiKey,
    chatbotId,
    primaryColor = '#3B82F6',
    welcomeMessage,
    placeholder,
    position = 'bottom-right'
}) => {
    // Initialize chatbot with the provided configuration
    useChatbot({
        apiKey,
        chatbotId,
        primaryColor,
        welcomeMessage,
        placeholder,
        position
    });

    // This component doesn't render anything visible
    // The chatbot widget is injected by the SDK
    return null;
};

export default Chatbot;
