import React, { useState, useRef, useEffect } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

function Voice({ setMessage, setSendingMessage, isListening, setIsListening , setIsAnswerd, typingRef}) {
    
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support Speech Recognition.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stops automatically when silence is detected
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            // console.log("🎙️ Listening...");
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join('');
            setIsAnswerd(true)
            setMessage(transcript);
        };

        recognitionRef.current.onend = () => {
            // console.log("⏸️ Speech recognition stopped (silence detected).");
            setSendingMessage(true);
            // ❌ No restart here
        };

        recognitionRef.current.onerror = (event) => {
            console.error("❌ Speech recognition error:", event.error);
            if(event.error==='network'){
                alert('no internet')
            }
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    function startListening() {
        window.speechSynthesis.cancel()
        clearTimeout(typingRef.current)
        if (!recognitionRef.current) return;
        setIsListening(true);
        setIsAnswerd(false)
        recognitionRef.current.start();
    }

    return (<>
    {!isListening?<button className="button" onClick={startListening}>
            Start Listening <MicIcon />
        </button>:null}</>
        
    );
}

export default Voice;
