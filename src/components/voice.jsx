import React, { useRef, useEffect, useState } from "react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

function Voice({ setMessage, setSendingMessage, isListening, setIsListening, setIsAnswerd, typingRef }) {
    const recognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);
    const [isManualStop, setIsManualStop] = useState(false);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("❌ Your browser does not support Speech Recognition.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = !/iPhone|iPad|iPod/i.test(navigator.userAgent); // ✅ iOS fix (forces auto-stop)
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            setIsManualStop(false);
            clearTimeout(silenceTimeoutRef.current);
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results).map((result) => result[0].transcript).join("");
            setIsAnswerd(true);
            setMessage(transcript);

            if (event.results[0].isFinal) {
                silenceTimeoutRef.current = setTimeout(() => {
                    stopListening();
                }, 2000); // ✅ Stops after 2 seconds of silence
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
            if (!isManualStop) {
                setSendingMessage(true); // ✅ Only sends message if user didn't manually stop
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error("❌ Speech recognition error:", event.error);
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    function startListening() {
        if (!recognitionRef.current) return;
        window.speechSynthesis.cancel();
        clearTimeout(typingRef.current);
        clearTimeout(silenceTimeoutRef.current);

        setIsListening(true);
        setIsAnswerd(false);
        setIsManualStop(false);

        recognitionRef.current.start();
    }

    function stopListening() {
        if (!recognitionRef.current) return;
        setIsManualStop(true);
        setIsListening(false);
        recognitionRef.current.stop();
    }

    return (
        <>
            {!isListening ? (
                <button className="button" onClick={startListening}>
                    Start Listening <MicIcon />
                </button>
            ) : (
                <button className="button stop" onClick={stopListening}>
                    Stop <MicOffIcon />
                </button>
            )}
        </>
    );
}

export default Voice;
