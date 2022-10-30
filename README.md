# Azure TTS Service
This is a simple NodeJS server that uses the
[Azure Cognitive Services](https://azure.microsoft.com/en-us/services/cognitive-services/text-to-speech/)
to convert text to speech.  
The server uses the [Azure Text Analysis](https://azure.microsoft.com/en-us/services/cognitive-services/text-analytics/)
to detect the language of the text and then uses the appropriate voice to
synthesize the speech.

## Currently Supported Languages and chosen Voices
* English (en)
  * en-AU-WilliamNeural
* Finnish (fi)
  * fi-FI-HarriNeural
* French (fr)
  * fr-FR-BrigitteNeural
* German (de)
  * de-DE-ChristophNeural
* Swedish (sv)
  * sv-SE-MattiasNeural
* Norwegian (no)
  * nb-NO-FinnNeural

If the language is not supported, the server will use the English voice.  
Feel free to make an issue or a pull request if you want to add more languages.  

You can find the list of all supported voices [here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#text-to-speech).  
You can test the voices [here](https://azure.microsoft.com/en-us/products/cognitive-services/text-to-speech/#features).  

## How to use
1. Clone the repository
2. Install the dependencies with `npm install`
3. Create a `.env` file with the following content:
```
SPEECH_KEY=
SPEECH_REGION=
TEXT_ANALYTICS_KEY=
TECT_ANALYTICS_ENDPOINT=
```
4. Insert your Azure Speech and Text Analytics keys in the `.env` file.  
   - Find your Speech key and resource region under the `Keys and Endpoint` tab in your Speech resource in Azure Portal.  
   - Find your Text Analytics key and endpoint under the `Keys and Endpoint` tab in your Text Analytics resource in Azure Portal.
5. Start the server with `npm start`
6. Send a get request to `http://localhost:3000/api/tts?text=Hello%20World!`  
   You can replace `Hello%20World!` with any text you want to convert to speech.  
   The server will return an audio file in the response.
