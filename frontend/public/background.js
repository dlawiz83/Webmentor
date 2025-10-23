chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "runLanguageModel") {
    (async () => {
      try {
        // Wait for LanguageModel API to become available
        let tries = 0;
        while (!("LanguageModel" in self) && tries < 40) {
          await new Promise((r) => setTimeout(r, 500));
          tries++;
        }

        if (!("LanguageModel" in self)) {
          throw new Error("LanguageModel API not available. Use Chrome 138+ with built-in AI.");
        }

        const availability = await LanguageModel.availability({
          outputLanguage: "en",
        });

        if (availability !== "available" && availability !== "downloadable") {
          throw new Error(`Model not ready: ${availability}`);
        }

        let session;
        if (availability === "downloadable") {
          session = await LanguageModel.create({
            outputLanguage: "en",
            monitor(m) {
              m.addEventListener("downloadprogress", (e) => {
                console.log(`Downloading model ${(e.loaded * 100).toFixed(1)}%`);
              });
            },
          });
        } else {
          session = await LanguageModel.create({ outputLanguage: "en" });
        }

        const result = await session.prompt(message.prompt);
        sendResponse({ result });
      } catch (error) {
        console.error("LanguageModel background error:", error);
        sendResponse({ error: error.message });
      }
    })();

    return true; // Keep the message channel open for async response
  }
  
 
});
