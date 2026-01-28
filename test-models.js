// list-models.js
const API_KEY = "AIzaSyA5SIi_6u2wXITq6PefJfwl0p1pDscQuCo"; // 🔴 PASTE YOUR KEY HERE

async function getAvailableModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

  console.log(`\n🔍 Querying Google API for available models...`);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error(`\n❌ API Error: ${data.error.message}`);
      return;
    }

    if (!data.models) {
      console.error("\n❌ No models returned. Check your API key permissions.");
      return;
    }

    const embeddingModels = data.models.filter(m =>
      m.supportedGenerationMethods.includes("embedContent")
    );

    const generationModels = data.models.filter(m =>
      m.supportedGenerationMethods.includes("generateContent")
    );

    console.log(`\n✅ SUCCESS! Found ${data.models.length} total models.\n`);

    console.log("------------------------------------------------");
    console.log(`🧠 EMBEDDING MODELS (Needed for 'Brain' Search)`);
    console.log("------------------------------------------------");
    if (embeddingModels.length > 0) {
      embeddingModels.forEach(m => {
        console.log(`Model Name: ${m.name}`);
        console.log(`   - Version: ${m.version}`);
        console.log(`   - Display: ${m.displayName}`);
      });
    } else {
      console.log("❌ NONE. Your API key does not have access to any embedding models.");
    }

    console.log("\n------------------------------------------------");
    console.log(`💬 CHAT MODELS (Needed for Chatbot)`);
    console.log("------------------------------------------------");
    if (generationModels.length > 0) {
      generationModels.forEach(m => {
        // Just print the clean name to keep it readable
        console.log(` - ${m.name.replace('models/', '')}`);
      });
    } else {
      console.log("❌ NONE.");
    }

  } catch (error) {
    console.error("Network request failed:", error);
  }
}

getAvailableModels();