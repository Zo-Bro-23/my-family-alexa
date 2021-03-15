const express = require('express')
const app = express()
const verifier = require('alexa-verifier-middleware')
const biographies = {zohan: 'Zohan is an awesome man, he is also known as ZoBro23.', subhash: 'Subhash is a cool dude. He is dad of ZoBro23.', shenuja: 'Shenuja is sus mom.'}
const references = {zohan: 'subhash', subhash: 'shenuja', shenuja: 'zohan'}

var alexaRouter = express.Router();
app.use('/alexaAction', alexaRouter);
alexaRouter.use(verifier)

alexaRouter.use(express.json())
alexaRouter.use(express.urlencoded({ extended: true }))

alexaRouter.post('/', alexaActionPost)

function alexaActionPost(req, resp){
    const { session, context, request } = req.body
    const { applicationId } = context.System.application
    const { type } = request

    if(type == 'LaunchRequest'){
      resp.send({
        response: {
          outputSpeech: {
            type: 'SSML',
            ssml: `<speak>Welcome to my family! Who do you want to know about? Oh, and if you are a noob, please say help, for god's sake, before trying out any stupid commands!</speak>`,
          },
          shouldEndSession: false,
          directives: [
            {
              "type": "Dialog.ElicitSlot",
              "slotToElicit": "person",
              "updatedIntent": {
                "name": "personBio",
                "confirmationStatus": "CONFIRMED",
                "slots": {
                }
              }
            }
          ]
        },
        version: '1.0',
        sessionAttributes: {},
      })
    }

    else if(type == 'IntentRequest'){
      if(request.intent.name == 'personBio'){
        if(request.intent.confirmationStatus == 'NONE'){
          resp.send({
            response: {
              outputSpeech: {
                type: 'SSML',
                ssml: `<speak>Are you sure you want to continue? I'm warning you, you CANNOT back down.</speak>`,
              },
              directives: [
                {
                  "type": "Dialog.ConfirmIntent",
                  "updatedIntent": {
                    "name": "personBio",
                    "confirmationStatus": "NONE",
                    "slots": {
                    }
                  }
                }
              ],
              shouldEndSession: false,
            },
            version: '1.0',
            sessionAttributes: {},
          })
        } else if(request.intent.confirmationStatus == 'DENIED'){
          resp.send({
            response: {
              outputSpeech: {
                type: 'SSML',
                ssml: `<speak>Ok, then. So long sucker!</speak>`,
              },
              shouldEndSession: true,
            },
            version: '1.0',
            sessionAttributes: {},
          })
        } else {
          if(request.intent.slots.person.value == 'zohan' || request.intent.slots.person.value == 'subhash' || request.intent.slots.person.value == 'shenuja'){
            resp.send({
              response: {
                outputSpeech: {
                  type: 'SSML',
                  ssml: `<speak>Well, here we go! ${biographies[request.intent.slots.person.value]} And you know who's related to ${request.intent.slots.person.value}? Well, ${references[request.intent.slots.person.value]}. Do you want to hear about them?</speak>`,
                },
                directives: [
                  {
                    "type": "Dialog.ConfirmIntent",
                    "updatedIntent": {
                      "name": "personBio",
                      "confirmationStatus": "NONE",
                      "slots": {
                        "person": {
                        "name": "person",
                        "value": references[request.intent.slots.person.value],
                        "resolutions": {},
                        "confirmationStatus": "NONE"
                      }
                    }
                    }
                  }
                ],
                shouldEndSession: false,
              },
              version: '1.0',
              sessionAttributes: {},
            })
          }else {
            resp.send({
              response: {
                outputSpeech: {
                  type: 'SSML',
                  ssml: `<speak>Last time I checked, ${request.intent.slots.person.value} is not in my family. Try again.</speak>`,
                },
                shouldEndSession: false,
                directives: [
                  {
                    "type": "Dialog.ElicitSlot",
                    "slotToElicit": "person",
                    "updatedIntent": {
                      "name": "personBio",
                      "confirmationStatus": "CONFIRMED",
                      "slots": {
                      }
                    }
                  }
                ]
              },
              version: '1.0',
              sessionAttributes: {},
            })
          }
        }
      } else if(request.intent.name == 'AMAZON.FallbackIntent'){
        resp.send({
          response: {
            outputSpeech: {
              type: 'SSML',
              ssml: `<speak>I'm not sure you're using this the right way.</speak>`,
            },
            shouldEndSession: false,
          },
          version: '1.0',
          sessionAttributes: {},
        })
    }else if(request.intent.name == 'AMAZON.CancelIntent' || request.intent.name == 'AMAZON.StopIntent' || request.intent.name == 'AMAZON.NavigateHomeIntent'){
      resp.send({
        response: {
          outputSpeech: {
            type: 'SSML',
            ssml: `<speak>So long, boss.</speak>`,
          },
          shouldEndSession: true,
        },
        version: '1.0',
        sessionAttributes: {},
      })
      }else if(request.intent.name == 'AMAZON.HelpIntent'){
        resp.send({
          response: {
            outputSpeech: {
              type: 'SSML',
              ssml: `<speak>Oh, sure! You know what to do. Just say Who is Zohan, Goddammit.</speak>`,
            },
            shouldEndSession: false,
          },
          version: '1.0',
          sessionAttributes: {},
        })
      }
    }else if(type == 'CanFullfillIntentRequest'){
      const canUnderstandFinal = {}
      const canFullfill = false
      for(key in request.intent.slots){
        if(slots[key].name == 'person' && (slots[key].value == 'zohan' || slots[key].value == 'shenuja' || slots[key].value == 'shenuja')){
        canUnderstandFinal[key] = {canUnderstand: "YES", canFullfill: "YES"}
        canFullfill = true
      }else {
        canUnderstandFinal[key] = {canUnderstand: "NO", canFullfill: "NO"}
      }
      if(canFullfill){
        resp.send({
          response: {
           canFullfillIntent: {
             canFullfill: "YES",
             slots: {
              ...canUnderstandFinal
             }
           }
          },
          version: '1.0',
        })
      }else {
        resp.send({
          response: {
           canFullfillIntent: {
             canFullfill: "NO",
             slots: {
              ...canUnderstandFinal
             }
           }
          },
          version: '1.0',
        })
      }
    }
  }
}
app.listen(5210)
