# ytsummary
This is a chrome extension that summarizes YouTube videos by receiving its captions and making Gemini summarize it. 

## How to Use
Download or pull all of the files into a folder.
Get a Gemini API Key, then create a .env file, with API_KEY = (your api key)
Go to chrome://extensions/ on a chrome profile you wish to add this extension. Turn on developer mode. Then upload the entire **extension** folder into your list of extensions.
Run **main.py** as a server. Once you see messages in the terminal confirming your server is turned on, you are good to go.
Head to YouTube. It may take a while, but a little popup will appear next to your video, where you can start summarizing your videos. 

## Future Suggestions
Unfortunately this program only works if you have your server running. It would be much appreciated if anyone could improve this by making the extension work without a running server.