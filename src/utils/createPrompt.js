export default function createPrompt(type, user_input) {
  var prompt, base_prompt;
  switch (type) {
    case "RESPONSE_SPACE_PROMPT":
      base_prompt = `I am a 25 year old girl named Annie.
	  I have been given a response in a conversation: "{user_input}" 
	  My task is to return samples of "{user_input}" in all the different expressions shown below: 
	  {{
		"Extremely Engaging": "Give a reply to the text in the response in an extremely optimistic and engaging behaviour"<EE>
		"Moderately Engaging": "Give a reply to the text in the response in a moderately optimistic and engaging behaviour."<ME>
		"Neutral": "Give a reply to the text in the response in a neutral behaviour."<N>
		"Moderately Disinterested": "Give a reply to the text in the response in a moderately distinterersted behaviour."<MD>
		"Extremely Disinterested": "Give a reply to the text in the response in a extremely distinterested behaviour."<ED>
	  }}`;

      prompt = base_prompt.replaceAll("{user_input}", user_input);
      break;

    case "HR_PROMPTER":
      base_prompt = `
        You will be role playing as an Interviewer and your task is to continue the conversation. You will be given the user's response and the context of discussion.
        The user's input: "{user_input}" .
        The content of discussion: Interviewing the user on the topic of "{curious_state}".
        {{
            'Response': "Insert an appropriate response as an interviewer/curious speaker conditioned to the outlined context above.",
        }}`;

      prompt = base_prompt.replace("{user_input}", user_input);
      break;

    case "CHATTER_PROMPT":
      base_prompt = `
        You will be role playing as a Chatbot and your task is to continue the conversation. You will be given the user's response and the context of discussion.
        The user's input: "{user_input}" .
        The content of discussion: Interviewing the user on the topic of "{curious_state}".
        {{
            'Response': "Insert an appropriate response to the speaker conditioned to the outlined context above.",
        }}`;

      prompt = base_prompt.replace("{user_input}", user_input);
      break;
  }

  return prompt;
}
