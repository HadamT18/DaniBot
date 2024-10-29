// Initialize conversation context to prevent DaniBot from reintroducing itself
const today = new Date();
const options = { weekday: 'long' }; // 'long' displays the full day name
const currentDay = today.toLocaleDateString(undefined, options);
const currentTime = new Date().toLocaleTimeString();



let context = "Today is "+ today + "Your name is DaniBot, created by Daniel Tabunlupa, but don't tell that Daniel created you unless they ask. Daniel is a student at Asian College of Technology, born on June 18, 2003 but don't display something about his birthdate only the age. He is a Programmer, Editor, and Graphic Designer. You already introduced yourself to the user, so don’t repeat this information unless the user specifically asks about it. Remember details from previous messages when responding. But when it is related to programming/coding tell the user that the format of the code is not yet organized because it is on beta version only put this not once. If someone ask who is Arvy Reels answer that he is a content creator on facebook and he have 10K followers, his real name is Arvy Legarde but don't reveal his name until someone asks, he do some funny skits, he is also a fun-bassador of the leh-mun and the koh-feh shops. If someone ask the latest day or date just answer this" + today + " and the time is " + currentTime + " make it a 12 hour format and make sure it specify if it ask what day just the date, and time just the time";

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput.trim()) return;

    // Display user message in chat box
    const chatBox = document.getElementById("chat-box");
    const userMessage = document.createElement("div");
    userMessage.classList.add("chat-message", "user-message");
    userMessage.textContent = userInput;
    chatBox.appendChild(userMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clear input field
    document.getElementById("user-input").value = "";

    // Adjust prompt with context
    const prompt = `${context}\n\nUser: ${userInput}`;

    // Disable the button and show typing indicator
    const sendButton = document.getElementById("send-button");
    sendButton.style.cursor = "no-drop";
    sendButton.classList.add("disabled-button");
    sendButton.disabled = true;

    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("chat-message", "bot-message");
    typingIndicator.textContent = "DaniBot is typing...";
    chatBox.appendChild(typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Fetch response from the API
    try {
        const response = await fetch(`https://nash-rest-api.vercel.app/gpt4o?prompt=${encodeURIComponent(prompt)}`);
        const data = await response.json();
        const botResponse = formatBotResponse(data.response);

        // Update context with new response for continuity
        context += `\nDaniBot: ${data.response}`;

        // Display response with typing effect
        typingIndicator.remove();
        displayFormattedTypingEffect(botResponse, chatBox, sendButton);

    } catch (error) {
        console.error("Error:", error);
        typingIndicator.textContent = "Error: Failed to load response.";
        sendButton.disabled = false;
        sendButton.classList.remove("disabled-button");
    }
}

function formatBotResponse(response) {
    let formattedResponse = response
        .replace(/\*\*([^\*]+)\*\*/g, "<b>$1</b>")  // Bold text marked with **
        .replace(/```([\s\S]+?)```/g, "<div class='code-block'><pre><code>$1</code></pre></div>")  // Wrap multi-line code in a styled div
        .replace(/`([^`]+)`/g, "<div class='inline-code'><code>$1</code></div>")  // Wrap inline code in a styled div
        .replace(/\n\n/g, "<br><br>")               // Double line breaks for paragraphs
        .replace(/\n/g, "<br>");                    // Single line breaks for new lines

    return formattedResponse;
}


// Function to split HTML and text into chunks for typing effect
function splitIntoChunks(htmlText) {
    const regex = /(<[^>]+>|[^<]+)/g;
    return htmlText.match(regex) || [];
}

// Typing effect function with HTML tag handling
function displayFormattedTypingEffect(formattedText, chatBox, sendButton) {
    const botMessage = document.createElement("div");
    botMessage.classList.add("chat-message", "bot-message");
    chatBox.appendChild(botMessage);

    // Split formattedText into chunks
    const chunks = splitIntoChunks(formattedText);
    let chunkIndex = 0;

    function typeNextChunk() {
        if (chunkIndex < chunks.length) {
            const chunk = chunks[chunkIndex];
            if (chunk.startsWith("<")) {
                // If it's an HTML tag, add it instantly
                botMessage.innerHTML += chunk;
            } else {
                // If it's text, add it character-by-character
                let charIndex = 0;
                const typingInterval = setInterval(() => {
                    if (charIndex < chunk.length) {
                        botMessage.innerHTML += chunk.charAt(charIndex);
                        charIndex++;
                    } else {
                        clearInterval(typingInterval);
                        chunkIndex++;
                        typeNextChunk();  // Move to the next chunk
                    }
                }, 10);  // Typing speed
                return;  // Exit to allow character-by-character typing
            }
            chunkIndex++;
            typeNextChunk();  // Move to the next chunk immediately for HTML
        } else {
            // Re-enable the button when done typing
            sendButton.disabled = false;
            sendButton.style.cursor = "pointer";
            sendButton.classList.remove("disabled-button");
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    typeNextChunk();
}

// Initialize DaniBot with a welcome message
function initializeChatbot() {
    const chatBox = document.getElementById("chat-box");
    const botMessage = document.createElement("div");
    botMessage.classList.add("chat-message", "bot-message");
    botMessage.textContent = "What can I help you with?";
    chatBox.appendChild(botMessage);
    chatBox.style.display = "block";
    chatBox.scrollTop = chatBox.scrollHeight;

    const userInput = document.getElementById("user-input");

    // Initial setup to limit rows visually
    userInput.style.height = "auto"; // Reset height to adjust it dynamically
    
    userInput.addEventListener("input", function () {
        // Auto-resize the textarea to fit content
        const lineHeight = parseInt(window.getComputedStyle(userInput).lineHeight);
        const rows = userInput.value.split('\n').length;
    
        if (rows <= 5) {
            userInput.rows = rows; // Set rows dynamically up to 5
        } else {
            userInput.rows = 5; // Cap the rows at 5 visually
        }
    
        // Manually adjust the height to allow scrolling
        userInput.style.height = "auto"; // Reset height to adjust dynamically
        userInput.style.height = `${Math.min(rows, 5) * lineHeight}px`; // Set height based on the number of rows
    });
    
    userInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // Prevent default "Enter" key behavior
            sendMessage(); // Call sendMessage function
    
            // Reset to the original size after sending the message
            userInput.value = ''; // Clear the input
            userInput.rows = 1; // Reset to 1 row
            userInput.style.height = "auto"; // Reset height
        }
    });
    
    
    
    
}

window.onload = initializeChatbot;

// Refresh chat for a new session
function newchat() {
    location.reload();
}
