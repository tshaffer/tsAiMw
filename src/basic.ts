import { ChatCompletionRequestMessage, ChatCompletionRequestMessageFunctionCall, ChatCompletionResponseMessage, Configuration, CreateChatCompletionResponse, OpenAIApi } from "openai";
import axios from 'axios';
import 'dotenv/config';
import { isNil } from 'lodash';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function getMealWheelUserId(name): Promise<string | undefined> {
  console.log(`Called getMealWheelUserId for user: `, name);

  const serverUrl = 'https://tsmealwheel.herokuapp.com';
  const apiUrlFragment = '/api/v1/';
  const path = serverUrl + apiUrlFragment + 'users';

  return axios.get(path)
    .then((usersResponse) => {
      const users = usersResponse.data;
      for (const user of users) {
        console.log('userName:', user.userName)
        if (user.userName === name) {
          return JSON.stringify({
            id: user.id
          });
        }
      }
    });
}

async function getMealWheelDishes(userId): Promise<any[] | undefined> {
  console.log('getMealWheelDishes for user id: ', userId);

  const serverUrl = 'https://tsmealwheel.herokuapp.com';
  const apiUrlFragment = '/api/v1/';
  const path = serverUrl + apiUrlFragment + 'dishes?id=' + userId;

  return axios.get(path)
    .then((dishesResponse) => {
      const dishEntitiesFromServer = dishesResponse.data;
      console.log('number of dishes: ', dishEntitiesFromServer.length);
      // console.log(typeof dishEntitiesFromServer);
      // console.log(dishEntitiesFromServer);
      return [];
    });

}

async function run_conversation() {

  const messages: ChatCompletionRequestMessage[] = [
    {
      role: "user",
      content:
        'What is the list of mealWheel dishes for the mealWheel user whose name is crapshack?',
    },
  ];

  const functions = [
    {
      name: "getMealWheelUserId",
      description: "Get a mealWheel user id given a mealWheel user name",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the mealWheel user",
          },
        },
        required: ["name"],
      },
    },
    {
      name: "getMealWheelDishes",
      description: "List the mealWheel dishes given a mealWheel user id",
      parameters: {
        type: "object",
        properties: {
          userId: {
            type: "string",
            description: "The id of the mealWheel user",
          },
        },
        required: ["id"],
      }
    }
  ];

  console.log('invoke open ai.createChatCompletion');
  let response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages,
    functions,
    function_call: 'auto',
  });
  console.log('return from openai.createChatCompletion');

  console.log('response keys');
  console.log(Object.keys(response));

  let responseData: CreateChatCompletionResponse = response.data;
  console.log('responseData keys');
  console.log(Object.keys(responseData));


  let response_messageRet: ChatCompletionResponseMessage | undefined = responseData["choices"][0]["message"];
  if (isNil(response_messageRet)) { debugger };
  let response_message = response_messageRet as ChatCompletionResponseMessage;
  console.log('response_message');
  console.log(response_message);

  const function_callRet: ChatCompletionRequestMessageFunctionCall | undefined = response_message["function_call"];
  if (isNil(function_callRet)) { debugger };
  const function_call: ChatCompletionRequestMessageFunctionCall = function_callRet as ChatCompletionRequestMessageFunctionCall;

  const function_nameRet: string | undefined = function_call['name'];
  if (isNil(function_nameRet)) { debugger };
  const function_name = function_nameRet as string;
  console.log('function_name');
  console.log(function_name);

  const function_argumentsRet: string | undefined = function_call['arguments'];
  if (isNil(function_argumentsRet)) { debugger };
  const function_arguments = function_argumentsRet as string;

  if (function_name === 'getMealWheelUserId') {

    let args = JSON.parse(function_arguments);
    console.log('args');
    console.log(args);
    console.log(args.name);

    const function_response = await getMealWheelUserId(args.name);
    console.log('mealWheelUserId: ');
    console.log(function_response);

    messages.push(
      {
        role: 'function',
        name: function_name,
        content: function_response,
      }
    );
    console.log('messages');
    console.log(messages);

    response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages,
      functions,
    });

    console.log('return from openai.createChatCompletion');

    console.log('response keys');
    console.log(Object.keys(response));

    responseData = response.data;
    console.log('responseData keys');
    console.log(Object.keys(responseData));

    response_message = responseData["choices"][0]["message"]
    console.log('response_message');
    console.log(response_message);

    function_name = response_message["function_call"]["name"];
    console.log('function_name');
    console.log(function_name);

    let function_args = response_message["function_call"]["arguments"];
    // console.log('function_args');
    // console.log(response_message["function_call"]["arguments"]);
    // console.log(function_args);
    // console.log(typeof function_args);

    let x = JSON.parse(function_args);
    // console.log(x);
    // console.log(x.userId);
    const userId = x.userId;
    console.log('userId: ', userId);
    console.log(typeof userId);

    const dishes = await getMealWheelDishes(userId);

    return 'poo';

  } else {
    return 'unexpected function name: ', function_name;
  }
}



export const run = async () => {
  console.log('foo');
};
