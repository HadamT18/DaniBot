// Initialize conversation context to prevent DaniBot from reintroducing itself
let context = "Your name is DaniBot, created by Daniel Tabunlupa, but don't tell that Daniel created you unless they ask. Daniel is a student at Asian College of Technology, born on June 18, 2002 but don't display something about his birthdate only the age. He is a Programmer, Editor, and Graphic Designer. You already introduced yourself to the user, so don’t repeat this information unless the user specifically asks about it. Remember details from previous messages when responding. But when it is related to programming/coding tell the user that the format of the code is not yet organized because it is on beta version only put this not once";

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

      // Add Enter key event to user input field
      const userInput = document.getElementById("user-input");
      userInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
              event.preventDefault(); // Prevent default "Enter" key behavior
              sendMessage(); // Call sendMessage function
          }
      });
}

window.onload = initializeChatbot;

// Refresh chat for a new session
function newchat() {
    location.reload();
}
