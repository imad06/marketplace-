import { useEffect } from 'react';

/**
 * Custom hook to integrate SaaS Chatbot into React application
 * 
 * @param {Object} config - Chatbot configuration
 * @param {string} config.apiKey - Your API key from the chatbot dashboard
 * @param {string} config.chatbotId - Your chatbot ID
 * @param {string} [config.primaryColor='#3B82F6'] - Primary color for the chatbot widget
 * @param {string} [config.welcomeMessage] - Custom welcome message
 * @param {string} [config.placeholder] - Custom input placeholder
 * @param {string} [config.position='bottom-right'] - Widget position (bottom-right, bottom-left, top-right, top-left)
 */
const useChatbot = (config) => {
    useEffect(() => {
        // Validate required config
        if (!config?.apiKey || !config?.chatbotId) {
            console.warn('Chatbot: apiKey and chatbotId are required');
            return;
        }

        // Check if script is already loaded
        if (window.SaaSChatbot) {
            window.SaaSChatbot.init(config);
            return;
        }

        // Create and load the chatbot script
        const script = document.createElement('script');
        script.src = '/chatbot.min.js';  // ✅ Load from public folder
        script.async = true;

        script.onload = () => {
            if (window.SaaSChatbot) {
                window.SaaSChatbot.init(config);
            }
        };

        script.onerror = () => {
            console.error('Failed to load chatbot SDK');
        };

        document.body.appendChild(script);

        // Cleanup function
        return () => {
            // Note: We don't remove the script on unmount to avoid re-loading
            // The chatbot widget will persist across route changes
        };
    }, [config]);

    // Return control functions
    return {
        open: () => window.SaaSChatbot?.open(),
        close: () => window.SaaSChatbot?.close(),
        toggle: () => window.SaaSChatbot?.toggle(),
    };
};

export default useChatbot;
