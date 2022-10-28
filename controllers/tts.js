const { TextAnalyticsClient, AzureKeyCredential } = require("@azure/ai-text-analytics");
const key = process.env.TEXT_ANALYTICS_KEY;
const endpoint = 'https://ts3ld.cognitiveservices.azure.com/';
// Authenticate the client with your key and endpoint
const textAnalyticsClient = new TextAnalyticsClient(endpoint, new AzureKeyCredential(key));

const detectLanguage = (text) => {
    text = text.replace(' by ', ' ');
    return new Promise((resolve, reject) => {
        textAnalyticsClient.detectLanguage([text]).then(languageResult => {
            resolve(languageResult[0].primaryLanguage);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
};

const { PassThrough } = require('stream');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
//Find your key and resource region under the 'Keys and Endpoint' tab in your Speech resource in Azure Portal
const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, "northeurope");
speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;

const getTTS = async (text) => {
    let voiceName = 'en-AU-WilliamNeural';
    const language = await detectLanguage(text);
    if(language.iso6391Name === 'fi'){
        voiceName = 'fi-FI-HarriNeural';
        text = text.replace(' by ', ' artistilta ');
    } else if(language.iso6391Name === 'de'){
        voiceName = 'de-DE-ChristophNeural';
        text = text.replace(' by ', ' von ');
    } else if(language.iso6391Name === 'fr'){
        voiceName = 'fr-FR-BrigitteNeural';
        text = text.replace(' by ', ' de ');
    } else if(language.iso6391Name === 'sv'){
        voiceName = 'sv-SE-MattiasNeural';
        text = text.replace(' by ', ' av ');
    } else if(language.iso6391Name === 'no'){
        voiceName = 'nb-NO-FinnNeural';
        text = text.replace(' by ', ' av ');
    } else if(language.iso6391Name === 'ru'){
        voiceName = 'uk-UA-OstapNeural';
        text = 'Слава Україні!';
    }
    console.log(`Detected language: ${language.name} - ${language.iso6391Name}`);
    console.log(`Synthesizing speech for text: ${text} with voice ${voiceName}`);
    speechConfig.speechSynthesisVoiceName = voiceName;
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
            text,
            result => {
                const {audioData} = result;

                synthesizer.close();

                // convert arrayBuffer to stream
                const bufferStream = new PassThrough();
                bufferStream.end(Buffer.from(audioData));
                resolve(bufferStream);
            },
            error => {
                console.log(error);
                synthesizer.close();
                reject(error);
            });
    });
};

module.exports = { getTTS };
