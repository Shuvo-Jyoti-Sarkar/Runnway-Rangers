import os
from flask import Flask, request, jsonify, render_template
import openai

app = Flask(__name__)

# Set your OpenAI API key here or via an environment variable.
openai.api_key = "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"

def get_chatgpt_response(message):
    """
    Uses the ChatGPT engine to answer any travel-related question in the language of the query.
    The system prompt instructs the assistant to behave as a knowledgeable travel assistant.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful and knowledgeable travel assistant. "
                        "Answer questions about airlines, airports, flights, baggage, security, lost items, dining, and any other travel-related topics. "
                        "Respond in the language that the question is asked."
                    )
                },
                {"role": "user", "content": message}
            ],
            temperature=0.7
        )
        answer = response['choices'][0]['message']['content'].strip()
    except Exception as e:
        print("Error calling OpenAI API:", e)
        answer = "Sorry, I'm having trouble processing your request at the moment."
    return answer

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.form.get("message", "")
    answer = get_chatgpt_response(user_message)
    return jsonify({"response": answer})

if __name__ == "__main__":
    app.run(debug=True)
