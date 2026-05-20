# 各地域配置不同，请根据实际地域修改
curl -X POST https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions \
-H "Authorization: Bearer $DASHSCOPE_API_KEY" \
-H "Content-Type: application/json" \
-d '{
    "model": "qwen3.6-plus",
    "messages": [
        {
            "role": "system",
            "content": "You are a helpful assistant."
        },
        {
            "role": "user", 
            "content": "你是谁？"
        }
    ]
}'

# 返回结果

{
    "choices": [
        {
            "message": {
                "role": "assistant",
                "content": "我是千问，阿里巴巴集团旗下的通义实验室自主研发的超大规模语言模型。我可以帮助你回答问题、创作文字，比如写故事、写公文、写邮件、写剧本、逻辑推理、编程等等，还能表达观点，玩游戏等。如果你有任何问题或需要帮助，欢迎随时告诉我！"
            },
            "finish_reason": "stop",
            "index": 0,
            "logprobs": null
        }
    ],
    "object": "chat.completion",
    "usage": {
        "prompt_tokens": 26,
        "completion_tokens": 66,
        "total_tokens": 92
    },
    "created": 1726127645,
    "system_fingerprint": null,
    "model": "qwen3.6-plus",
    "id": "chatcmpl-81951b98-28b8-9659-ab07-xxxxxx"
}
