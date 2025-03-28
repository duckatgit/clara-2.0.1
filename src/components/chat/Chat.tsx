import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Mic, MicOff, Crown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useChat } from '../../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ElevenLabsClient } from "elevenlabs";
import { api } from '@/lib/supabase';
// import { Readable } from 'stream';

const Chat = () => {
  const client = new ElevenLabsClient({ apiKey: import.meta.env.VITE_ELEVENLABS_API_KEY });
  const navigate = useNavigate();
  const deepgram_api_key = import.meta.env.VITE_DEEPGRAM_API_KEY
  console.log('deepgram_api_key', deepgram_api_key)

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage, sendMessageNoStreaming, messageLimitInfo } = useChat();
  console.log('messages', messages)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleUpgradeClick = () => {
    navigate('/pricing');
  };

  const [isPremium, setIsPremium] = useState(false)

  const getSubcription = async () => {
    try {

      const data: any = await api.updateSubscriptionFromStripe()
      if (!data) {
        const subscriptionData: any = await api.getSubscription()
        console.log('subscriptionData?.is_premium', subscriptionData)
        return;
      }
      else {
        const subscriptionData: any = await api.getSubscription()
        console.log('subscriptionData?.is_premium', subscriptionData?.is_premium)
        if (subscriptionData?.data?.is_premium) {
          setIsPremium(true)
        }
        return;
      }
    } catch (err) {
      const subscriptionData: any = await api.getSubscription()
      console.log('subscriptionData', subscriptionData?.data)
    }
  }

  useEffect(() => {
    getSubcription();
  }, []);

  const handleStartRecording = async () => {
    try {
      // Remove HTTPS check completely
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: 1
      };

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });

      // Browser detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

      // Select MIME type based on browser support
      let mimeType = 'audio/webm; codecs=opus';
      if (isIOS || isSafari) {
        mimeType = 'audio/mp4'; // Safari/iOS requires this format
      } else if (isAndroid) {
        mimeType = 'audio/webm'; // Android Chrome prefers simple webm
      }

      // Verify MIME type support
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Let browser choose default
      }

      // Create media recorder with cross-platform settings
      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000,
        bitsPerSecond: 128000
      });

      // Cross-platform cleanup handler
      const cleanup = () => {
        stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        setMediaRecorder(null);
        setIsRecording(false);
      };

      // Handle iOS/Safari user interaction requirements
      let interactionTimeout: NodeJS.Timeout;
      if (isIOS || isSafari) {
        interactionTimeout = setTimeout(() => {
          toast.error("Please tap again to start recording!");
          cleanup();
        }, 300);
      }

      let audioChunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        clearTimeout(interactionTimeout);
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      recorder.onerror = (event:any) => {
        console.error('Recording error:', event?.error);
        toast.error(`Recording failed: ${event?.error?.message || 'Unknown error'}`);
        cleanup();
      };

      recorder.onstart = () => {
        console.log('Recording started');
        setAudioChunks([]);
      };

      recorder.onstop = async () => {
        try {
          console.log("⏹️ Recording stopped");

          if (audioChunks.length === 0) {
            console.warn("❌ No audio recorded");
            return;
          }

          const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
          setAudioChunks([]); // Reset state after using audioChunks

          setLoading(true);

          // Step 1: Send audio to Deepgram for transcription
          const formData = new FormData();
          formData.append("audio", audioBlob);

          const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen", {
            method: "POST",
            headers: {
              Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
            },
            body: formData,
          });

          if (!deepgramResponse.ok) {
            throw new Error("Failed to transcribe audio");
          }

          const deepgramData = await deepgramResponse.json();
          const transcribedText = deepgramData.results.channels[0].alternatives[0].transcript;

          if (!transcribedText) {
            toast.error("No transcription available");
            return;
          }

          // Step 2: Send transcription to GPT
          const gptResponse = await sendMessageNoStreaming(transcribedText);
          const gptText = typeof gptResponse === "string" ? gptResponse : "";

          // Step 3: Convert GPT response to speech with ElevenLabs
          const elevenLabsResponse = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
            output_format: "mp3_44100_128",
            text: gptText,
            model_id: "eleven_multilingual_v2",
          });

          // Convert readable stream to ArrayBuffer
          const readableToArrayBuffer = async (readable: any) => {
            const chunks = [];
            for await (const chunk of readable) {
              chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
            }
            return new Blob(chunks).arrayBuffer();
          };

          const audioBuffer = await readableToArrayBuffer(elevenLabsResponse);
          const audioContext = new AudioContext();
          const audioSource = audioContext.createBufferSource();
          const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
          audioSource.buffer = decodedAudio;
          audioSource.connect(audioContext.destination);
          audioSource.start();

          setInput("");
        } catch (error) {
          console.error('Processing error:', error);
          toast.error(error instanceof Error ? error.message : 'Processing failed');
        } finally {
          cleanup();
        }
      };

      // Start recording with platform-appropriate time slice
      const timeSlice = isIOS ? 1000 : 250; // iOS needs larger chunks
      recorder.start(timeSlice);
      setIsRecording(true);
      setMediaRecorder(recorder);

    } catch (error: any) {
      console.error('Recording setup error:', error);
      
      const errorMap: Record<string, string> = {
        NotAllowedError: 'Microphone access denied - please allow microphone access',
        NotFoundError: 'No microphone found',
        NotSupportedError: 'Browser does not support audio recording',
        SecurityError: 'Recording blocked by security settings',
        TypeError: 'Invalid media constraints'
      };

      toast.error(errorMap[error.name] || `Recording failed: ${error.message}`);
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };


  // const handleStartRecording = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  //     console.log("🎙️ Audio stream:", stream);

  //     const recorder = new MediaRecorder(stream);
  //     console.log("📽️ MediaRecorder initialized:", recorder);

  //     setMediaRecorder(recorder);

  //     let localChunks: any[] = []; // Use a local array to store chunks

  //     recorder.ondataavailable = (event) => {
  //       console.log("🔹 ondataavailable event triggered:", event);

  //       if (event.data.size > 0) {
  //         localChunks.push(event.data); // Push directly into local variable
  //         setAudioChunks((prev) => [...prev, event.data]); // Update state (but don't rely on it here)
  //         console.log("✅ Adding chunk:", event.data);
  //       } else {
  //         console.warn("⚠️ Empty audio chunk received");
  //       }
  //     };

  //     recorder.onstart = () => {
  //       console.log("▶️ Recording started");
  //     };

  //     recorder.onstop = async () => {
  //       console.log("⏹️ Recording stopped");

  //       if (localChunks.length === 0) {
  //         console.warn("❌ No audio recorded");
  //         return;
  //       }

  //       const audioBlob = new Blob(localChunks, { type: "audio/webm" });
  //       setAudioChunks([]); // Reset state after using localChunks

  //       try {
  //         setLoading(true);

  //         // Step 1: Send audio to Deepgram for transcription
  //         const formData = new FormData();
  //         formData.append("audio", audioBlob);

  //         const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen", {
  //           method: "POST",
  //           headers: {
  //             Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
  //           },
  //           body: formData,
  //         });

  //         if (!deepgramResponse.ok) {
  //           throw new Error("Failed to transcribe audio");
  //         }

  //         const deepgramData = await deepgramResponse.json();
  //         const transcribedText = deepgramData.results.channels[0].alternatives[0].transcript;

  //         if (!transcribedText) {
  //           toast.error("No transcription available");
  //           return;
  //         }

  //         // Step 2: Send transcription to GPT
  //         const gptResponse = await sendMessageNoStreaming(transcribedText);
  //         const gptText = typeof gptResponse === "string" ? gptResponse : "";

  //         // Step 3: Convert GPT response to speech with ElevenLabs
  //         const elevenLabsResponse = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
  //           output_format: "mp3_44100_128",
  //           text: gptText,
  //           model_id: "eleven_multilingual_v2",
  //         });

  //         // Convert readable stream to ArrayBuffer
  //         const readableToArrayBuffer = async (readable: any) => {
  //           const chunks = [];
  //           for await (const chunk of readable) {
  //             chunks.push(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
  //           }
  //           return new Blob(chunks).arrayBuffer();
  //         };

  //         const audioBuffer = await readableToArrayBuffer(elevenLabsResponse);
  //         const audioContext = new AudioContext();
  //         const audioSource = audioContext.createBufferSource();
  //         const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
  //         audioSource.buffer = decodedAudio;
  //         audioSource.connect(audioContext.destination);
  //         audioSource.start();

  //         setInput("");
  //       } catch (error) {
  //         console.error("❌ Error processing voice input:", error);
  //         toast.error("Failed to process voice input");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };

  //     recorder.start();
  //     setIsRecording(true);
  //   } catch (error) {
  //     console.error("❌ Error starting recording:", error);
  //     toast.error("Failed to start recording");
  //   }
  // };


  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Messages */}
      <div className="pt-2 pb-2 h-full   overflow-y-scroll">
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "flex items-start space-x-4",
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Bot className="w-6 h-6 text-violet-400" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === 'assistant'
                      ? "bg-white/5 text-white"
                      : "bg-violet-500 text-white"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div className="p-2 rounded-lg bg-violet-600">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message limit info */}
      <div className='bottom-0 absolute w-full'>

    
      {messageLimitInfo && !messageLimitInfo.isPremium && (
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 ">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>
                {messageLimitInfo.used} / {messageLimitInfo.limit} messages used today
              </span>
              {!messageLimitInfo.isPremium && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpgradeClick}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white flex items-center space-x-1"
                >
                  <Crown className="w-4 h-4" />
                  <span>Upgrade</span>
                </motion.button>
              )}
            </div>
            {messageLimitInfo.used >= messageLimitInfo.limit && (
              <span className="text-sm text-red-400">
                Daily limit reached
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className=" w-full  border-t border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={cn(
                "w-full px-4 py-3 pr-12 rounded-xl",
                "bg-white/5 border border-white/10",
                "text-white placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-violet-500/50",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={cn(
                "absolute right-12 top-1/2 -translate-y-1/2",
                "p-2 rounded-lg",
                "text-gray-400 hover:text-white",
                "transition-colors duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </button>
            <button
              type="button"
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2",
                "p-2 rounded-lg",
                isRecording ? "text-red-400" : "text-gray-400 hover:text-white",
                "transition-colors duration-200"
              )}
            >
              {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default Chat;