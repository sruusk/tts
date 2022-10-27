const { PassThrough } = require('stream');
const sdk = require("microsoft-cognitiveservices-speech-sdk");
//Find your key and resource region under the 'Keys and Endpoint' tab in your Speech resource in Azure Portal
const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, "northeurope");
speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio48Khz192KBitRateMonoMp3;

const getTTS = (text, voiceName) => {
    console.log(`Synthesizing speech for text: ${text}`);
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

module.exports = {getTTS};
