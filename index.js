const Alexa = require('ask-sdk-core');
const qa = require('./modules/qa.js');
const groups = require('./data/group_ques.json');

const WelcomeMessage = "Welcome to VoiceQube. We will be happy answering your questions about VoiceQube";
const WelcomeReprompt = "You can ask me questions about VoiceQube";
const HelpMessage = "You can ask about voiceQube. I'll be happy to address the questions";
const HelpReprompt = "You can ask about voiceQube. I'll be happy to address the questions";
const NotAnswerableMessage = "Sorry I\'m unable to answer that. Ask me another question";
const ErrorMessage = "Sorry, I can\'t understand the command. Please say again.";
const ErrorReprompt = "Sorry, I can\'t understand the command. Please say again.";
const EndMessage = "Hope to hear from you soon. Good Bye";
const NoIntentMessage = "Sure. You can ask me another question";

async function answerfunction(id,handlerInput){
  var speechText = "";
  var currQuesDetails = await getspeechtextDetails(id);

  let answer = currQuesDetails.answer;
  let prompt = currQuesDetails.prompt;
  let grpId = currQuesDetails.gid;
  
  let group_questions = groups.filter(function(x){
        return (x.gid === grpId);
      });

  const myAttributesManager = handlerInput.attributesManager;
  var mySessionAttributes = myAttributesManager.getSessionAttributes();
  const responseBuilder = handlerInput.responseBuilder;
  var answeredQuesIDs = mySessionAttributes.questionsAnswered;
  
  var next_question_id = await getnextquesid(group_questions, answeredQuesIDs);
  
  if(next_question_id != 'default-question'){
     mySessionAttributes.quesIDTobeAnswered = next_question_id;
     myAttributesManager.setSessionAttributes(mySessionAttributes);
     var nextques_details = await getspeechtextDetails(next_question_id);  
     var followUpQuestion = nextques_details.question;
     speechText = `${answer} ${followUpQuestion}`;  
  }
  else{
    mySessionAttributes.quesIDTobeAnswered = "";
    speechText = `${answer} ${prompt}`;
  }
                                                                  
  return speechText;
}

async function getspeechtextDetails(id){
  var details = {};
  await qa.getQuestionById(id).then(function(data){
    details = {
        "question": data[0].questions,
        "answer": data[0].answer,
        "prompt": data[0].prompt,
        "gid": data[0].gid
    };
  }, function(err){
    details = {
        "question": "",
        "answer": "",
        "prompt": "you can ask me another question",
        "gid": "one"
     };
  });
  return details;
}

async function getnextquesid(group_questions,sa){
    var group_question_ids = group_questions[0].questions;
    //console.log(typeof(sa));
    let ques_size = sa.length;
    var unanswered = group_question_ids.filter(n => !sa.includes(n));
    console.log(unanswered);
    if(unanswered.length > 0){
      var randomnum = Math.floor(Math.random() * unanswered.length);
      return unanswered[randomnum];
    }
    else{
      return "default-question";
    }
}

function updateSessionAttr(handlerInput,id){
      const myAttributesManager = handlerInput.attributesManager;
      var mySessionAttributes = myAttributesManager.getSessionAttributes();
      const responseBuilder = handlerInput.responseBuilder;
      
      if(!mySessionAttributes.hasOwnProperty("questionsAnswered")){
        mySessionAttributes.questionsAnswered = [];
      }
      const found = mySessionAttributes.questionsAnswered.find( x => x === id );
      if(found === undefined){
        mySessionAttributes.questionsAnswered.push(id);
      }
      myAttributesManager.setSessionAttributes(mySessionAttributes);
}

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = WelcomeMessage;
    const promptText = WelcomeReprompt;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(promptText)
      .getResponse();
  },
};
const AboutIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AboutIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.aboutQuestions
      && handlerInput.requestEnvelope.request.intent.slots.aboutQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.aboutQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.aboutQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
          resolution = handlerInput.requestEnvelope.request.intent.slots.aboutQuestions.resolutions.resolutionsPerAuthority[0];
          let id = resolution.values[0].value.id;
    
          await updateSessionAttr(handlerInput,id);
          let speechText = await answerfunction(id,handlerInput);
    
          return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt('Ask another question.')
          .getResponse();
        }
    
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const ProductsIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'ProductsIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.productsQuestions
      && handlerInput.requestEnvelope.request.intent.slots.productsQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.productsQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.productsQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
    resolution = handlerInput.requestEnvelope.request.intent.slots.productsQuestions.resolutions.resolutionsPerAuthority[0];
      let id = resolution.values[0].value.id;

      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();

    }
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const ProjectIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'ProjectIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.projectQuestions
      && handlerInput.requestEnvelope.request.intent.slots.projectQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.projectQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.projectQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
      resolution = handlerInput.requestEnvelope.request.intent.slots.projectQuestions.resolutions.resolutionsPerAuthority[0];
      let id = resolution.values[0].value.id;
      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();
    } 
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const SecurityIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'SecurityIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.securityQuestions
      && handlerInput.requestEnvelope.request.intent.slots.securityQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.securityQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.securityQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
      resolution = handlerInput.requestEnvelope.request.intent.slots.securityQuestions.resolutions.resolutionsPerAuthority[0];
      let id = resolution.values[0].value.id;
      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();
    } 
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const ContactIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'ContactIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.contactQuestions
      && handlerInput.requestEnvelope.request.intent.slots.contactQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.contactQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.contactQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
      resolution = handlerInput.requestEnvelope.request.intent.slots.contactQuestions.resolutions.resolutionsPerAuthority[0];
      let id = resolution.values[0].value.id;
      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();
    } 
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const RecruitmentIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'ContactIntent') ;
  },
  async handle(handlerInput) {
    let resolution;
    if(handlerInput.requestEnvelope
      && handlerInput.requestEnvelope.request
      && handlerInput.requestEnvelope.request.intent
      && handlerInput.requestEnvelope.request.intent.slots
      && handlerInput.requestEnvelope.request.intent.slots.recruitmentQuestions
      && handlerInput.requestEnvelope.request.intent.slots.recruitmentQuestions.resolutions
      && handlerInput.requestEnvelope.request.intent.slots.recruitmentQuestions.resolutions.resolutionsPerAuthority[0]
      && (handlerInput.requestEnvelope.request.intent.slots.recruitmentQuestions.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH")) {
          
      resolution = handlerInput.requestEnvelope.request.intent.slots.recruitmentQuestions.resolutions.resolutionsPerAuthority[0];
      let id = resolution.values[0].value.id;
      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);

      return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt('Ask another question.')
      .getResponse();
    } 
    else {
      let speechText = NotAnswerableMessage;
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  },
};

const yesIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'YesIntent';
  },
  async handle(handlerInput) {
    let resolution = handlerInput.requestEnvelope.request.intent.slots.continue.resolutions.resolutionsPerAuthority[0];
      const myAttributesManager = handlerInput.attributesManager;
      var mySessionAttributes = myAttributesManager.getSessionAttributes();
      const id = mySessionAttributes.quesIDTobeAnswered;
      console.log("yes to the question: " + id);
      await updateSessionAttr(handlerInput,id);
      let speechText = await answerfunction(id,handlerInput);
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
  },
};

const noIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NoIntent';
  },
  async handle(handlerInput) {

    let speechText = NoIntentMessage;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = HelpMessage;
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = EndMessage;
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak(ErrorMessage)
      .reprompt(ErrorReprompt)
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    AboutIntentHandler,
    ProductsIntentHandler,
    ProjectIntentHandler,
    SecurityIntentHandler,
    ContactIntentHandler,
    RecruitmentIntentHandler,
    yesIntentHandler,
    noIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
