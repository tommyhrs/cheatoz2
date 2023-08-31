chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.action === "fetchExplanation") {
    const { text, position, requestId } = request.data;

    const prompt1 = `This is either an mcq or a short answer question. Please choose the correct answer:`;
    const prompt = `${prompt1} ${text}`;
    console.log('Constructed prompt:', prompt);

    const explanation = await fetchExplanation(prompt);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "showExplanation",
          data: {
            explanation,
            position,
            requestId,
          },
        });
      } else {
        console.error('No active tab found.');
      }
    });
  }
});


// ... (rest of the code)


async function fetchExplanation(prompt) {
  const apiKey = await new Promise((resolve) => {
    chrome.storage.sync.get("apiKey", (result) => {
      resolve(result.apiKey);
    });
  });

  if (!apiKey) {
    console.error("API key not set. Please set your API key in the extension popup.");
    return;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  });

  const data = await response.json();
  console.log('OpenAI API response:', data);

  if (data && data.error) {
    let errorMessage = data.error.message;
    return errorMessage;
  } else if (data && data.choices && data.choices.length > 0) {
    let explanation = data.choices[0].message.content;
    return explanation;
  }
}



