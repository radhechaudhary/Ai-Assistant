import { useEffect, useRef, useState } from 'react'
import Voice from './components/voice'
import doraemon from './assets/doraemon.png'
import run from './gemini'
import recording from './assets/recording.gif'

function App() {
  const [message, setMessage]= useState("");
  const [sendingMessage, setSendingMessage]= useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAnswerd, setIsAnswerd]= useState(false);
  const typingRef= useRef();
  const scrollBottomRef= useRef();

  useEffect(()=>{window.speechSynthesis.cancel()},[]) // useEffect to stop the previos speech on reloading
  
  useEffect(()=>{
    
    function speakText(text) { // function to speak the message from gemini
      if (!text || typeof text !== "string") {
          console.warn("Invalid text input for speech synthesis.");
          return;
      }
      setIsAnswerd(true)
      const synth = window.speechSynthesis;
      synth.cancel(); // 🔹 Stops any ongoing speech before starting fresh
  
      const maxChunkLength = 200; // 🔹 Limit per chunk (adjust as needed)
      const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]; // 🔹 Split by sentence
      let chunks = [];
      let currentChunk = "";
  
      sentences.forEach((sentence) => {
          if ((currentChunk + sentence).length > maxChunkLength) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence;
          } else {
              currentChunk += sentence;
          }
      });
  
      if (currentChunk) {
          chunks.push(currentChunk.trim());
      }  
      let index = 0;
      let typingIndex=0;
      let displayedText = "";

      function speakNextChunk() { // function to speak every chunk
          if (index < chunks.length) {
              const utterance = new SpeechSynthesisUtterance(chunks[index]);
              utterance.rate = 1; // 🔹 Adjust speed (1 = normal)
              utterance.pitch = 1; // 🔹 Adjust pitch

              function typeEffect(chunk) { // function for typing effect when the agent speaks
                if (typingIndex < chunk.length) {
                    displayedText += chunk[typingIndex];
                    setMessage(displayedText + "|"); // Show typing effect
                    typingIndex++;
                    typingRef.current = setTimeout(() => typeEffect(chunk), 50);
                } else {
                    setMessage(displayedText); // Remove cursor when typing finishes
                }
                const div = scrollBottomRef.current;
                if (div) { // always keep the bottom view
                  div.scrollTo({
                  top: div.scrollHeight,
                  behavior: 'smooth' // Smooth scrolling
                  });
                }
              }
              utterance.onstart=()=>{
                typingIndex = 0;
                typeEffect(chunks[index]);
              }
              utterance.onend = () => {
                  index++;
                  speakNextChunk(); // 🔹 Ensures smooth transition
              };
              utterance.onerror = (e) => console.error("Speech synthesis error:", e.message);
              synth.speak(utterance); // 🔥 Ensures browser fully loads speech
          }
          else{
            setMessage(text)
          }
      }
  
      // 🔹 Ensure browser allows speech synthesis before speaking
      if (synth.speaking || synth.pending) {
          console.warn("Speech synthesis is already running.");
          return;
      }
      speakNextChunk(); // ✅ Start speaking
  }
    if(sendingMessage && message.length>0){
      setSendingMessage(false)
      run(message)
      .then((data) => {
        if (data) {
          setTimeout(()=>setIsListening(false), 500)
          speakText(data);
        }
        else setIsListening(false);
      })
    }
  },[sendingMessage])
  
  
  return (
    <div className="container">
      <img className="doraemon" src={doraemon}/>
      <h2 className="Ai_name" style={{fontSize:"30px"}}> Hi! I am Doraemon</h2>
      <div className='box'>
        <Voice  setMessage={setMessage} setSendingMessage={setSendingMessage} isListening={isListening} setIsListening={setIsListening} setIsAnswerd={setIsAnswerd} typingRef={typingRef}/>
        {isListening?<img src={recording}/>:null}
        {isAnswerd?<div className="ques_ans" ref={scrollBottomRef}>
          <h3 style={{fontSize:'16px', transition:'width 1s ease-in-out'}}>{message}</h3>
        </div>:null}
      </div>
    </div>
  )
}

export default App
