document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // User xabarini qo'sh
        addMessage(message, 'user');
        userInput.value = '';
        sendBtn.disabled = true;
        sendBtn.textContent = 'Yuklanmoqda...';

        try {
            // Back-end ga POST so'rov
            const response = await fetch('https://deeb-backend-aw81.onrender.com/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: message })
            });

            if (!response.ok) throw new Error('Xato: Server javob bermadi');

            const data = await response.json();
            addMessage(data.response, 'ai');
        } catch (error) {
            addMessage('Xato: ' + error.message + '. Serverni tekshiring.', 'ai');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Yuborish';
        }
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
        div.textContent = text;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
});