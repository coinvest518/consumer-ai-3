import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceInputProps {
  onTranscriptChange: (transcript: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptChange, onListeningChange }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    onTranscriptChange(transcript);
  }, [transcript, onTranscriptChange]);

  useEffect(() => {
    onListeningChange(listening);
  }, [listening, onListeningChange]);

  const handleToggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <p className="text-xs text-red-500">Speech recognition not supported.</p>;
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleToggleListening}
      className={cn(
        "h-11 w-11 rounded-full transition-all duration-200",
        listening ? "bg-red-500/20 text-red-500" : "hover:bg-gray-100"
      )}
    >
      {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </Button>
  );
};

export default VoiceInput;