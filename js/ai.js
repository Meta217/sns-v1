// ai.js
const MOONSHOT_API_KEY = "sk-geEmHkdZtmBS9VdtFSduppfT5eOosqXGs6oxWJfo7scIRuBz"; // Replace with your actual API key

async function generateComment(postText, personalityPrompt, robotName) {
    const prompt = `You are ${robotName}, and you are a ${personalityPrompt}. Respond to this post: "${postText}"`;

    try {
        const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MOONSHOT_API_KEY}`
            },
            body: JSON.stringify({
                model: "moonshot-v1-8k",
                messages: [
                    { role: "system", content: "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文对话。现在请你进行角色扮演，你是发布帖子的用户的关注者或者朋友，并根据帖子的内容进行回复，请注意，每次回复的字数不超过100个字。" },
                    { role: "user", content: prompt }
                ],
                temperature: 0.3
            })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            console.error('Unexpected API response:', data);
            return "Unexpected API response"; // Default comment
        }
    } catch (error) {
        console.error('Error generating comment:', error);
        return "Interesting post!"; // Default comment
    }
}