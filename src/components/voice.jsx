import React, { useRef, useEffect } from "react";
import MicIcon from "@mui/icons-material/Mic";

function Voice({ setMessage, setSendingMessage, isListening, setIsListening, setIsAnswerd, typingRef }) {
    const recognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("❌ Your browser does not support Speech Recognition.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // ✅ Stops when silence is detected
        recognitionRef.current.interimResults = true; // ✅ Show partial results before finalizing
        recognitionRef.current.lang = "en-US"; // ✅ Set language to English

        recognitionRef.current.onstart = () => {
            setIsListening(true);
            clearTimeout(silenceTimeoutRef.current); // ✅ Reset silence timer on start
        };

        recognitionRef.current.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0].transcript)
                .join("");

            setIsAnswerd(true);
            setMessage(transcript);

            if (event.results[0].isFinal) {
                // ✅ Start a silence timer when final speech is detected
                silenceTimeoutRef.current = setTimeout(() => {
                    stopListening();
                }, 2000); // ✅ Adjust timeout for silence detection
            }
        };

        recognitionRef.current.onend = () => {
            if (!isListening) return; // ✅ Prevent double stopping
            stopListening();
        };

        recognitionRef.current.onerror = (event) => {
            console.error("❌ Speech recognition error:", event.error);
            if (event.error === "network") {
                alert("❌ No Internet Connection!");
            }
            stopListening();
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort(); // ✅ Stops recognition properly on unmount
            }
        };
    }, []);

    function startListening() {
        if (!recognitionRef.current) return;
        window.setTimeout(() => {
            window.speechSynthesis.cancel();
        }, 100);
        if (typingRef.current) {
            clearTimeout(typingRef.current);
            typingRef.current = null;
        }
        setIsListening(true);
        setIsAnswerd(false);
        recognitionRef.current.start();
    }
    function stopListening() {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setSendingMessage(true); // ✅ Sends the message when silence is detected
    }
    return (
        <>
            {!isListening ? (
                <button className="button" onClick={startListening}>
                    Start Listening <MicIcon />
                </button>
            ) : null}
        </>
    );
}

export default Voice;
