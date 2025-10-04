import { useState, useEffect, useRef } from 'react'
import { STB_QUESTIONS } from '../data/arlKnowledgePack'
import type { STBAnswer } from '../types/arlTypes'

interface STBInterviewProps {
  onComplete: (answers: STBAnswer[]) => void
  onSave: (answers: STBAnswer[]) => void
  initialAnswers?: STBAnswer[]
}

export default function STBInterview({ onComplete, onSave, initialAnswers = [] }: STBInterviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<STBAnswer[]>(initialAnswers)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [normalizedAnswer, setNormalizedAnswer] = useState<Record<string, any>>({})
  const [evidenceLinks, setEvidenceLinks] = useState<any[]>([])
  const [gaps, setGaps] = useState<string[]>([])
  
  const _mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        processAnswer(transcript)
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
      }
    }
  }, [])

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false)
      recognitionRef.current.stop()
    }
  }

  const playQuestion = async () => {
    const question = STB_QUESTIONS[currentQuestion]
    setIsPlaying(true)
    
    try {
      // Use ElevenLabs TTS API (would need API key in production)
      const response = await fetch('/api/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question.question })
      })
      
      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        audioRef.current = new Audio(audioUrl)
        audioRef.current.onended = () => setIsPlaying(false)
        audioRef.current.play()
      }
    } catch (error) {
      console.error('TTS error:', error)
      setIsPlaying(false)
    }
  }

  const processAnswer = async (answerText: string) => {
    const question = STB_QUESTIONS[currentQuestion]
    
    try {
      // Send to LLM for normalization
      const response = await fetch('/api/llm/normalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.question,
          answer: answerText,
          schema: question.schema
        })
      })
      
      const result = await response.json()
      setNormalizedAnswer(result.normalized)
      
      // Find evidence links
      const evidenceResponse = await fetch('/api/evidence/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestone: question.evidenceMapping,
          answer: answerText
        })
      })
      
      const evidenceResult = await evidenceResponse.json()
      setEvidenceLinks(evidenceResult.links)
      setGaps(evidenceResult.gaps)
      
    } catch (error) {
      console.error('Answer processing error:', error)
    }
  }

  const saveAnswer = () => {
    const question = STB_QUESTIONS[currentQuestion]
    const newAnswer: STBAnswer = {
      questionId: question.id,
      answer: transcript,
      normalizedAnswer,
      evidenceLinks,
      gaps,
      confidence: 0.8 // Would be calculated by LLM
    }
    
    const updatedAnswers = [...answers]
    const existingIndex = updatedAnswers.findIndex(a => a.questionId === question.id)
    
    if (existingIndex >= 0) {
      updatedAnswers[existingIndex] = newAnswer
    } else {
      updatedAnswers.push(newAnswer)
    }
    
    setAnswers(updatedAnswers)
    setTranscript('')
    setNormalizedAnswer({})
    setEvidenceLinks([])
    setGaps([])
  }

  const nextQuestion = () => {
    saveAnswer()
    if (currentQuestion < STB_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(answers)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const currentAnswer = answers.find(a => a.questionId === STB_QUESTIONS[currentQuestion].id)

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#202538]">STB Interview</h2>
          <div className="text-sm text-gray-600">
            Question {currentQuestion + 1} of {STB_QUESTIONS.length}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-[#00A29D] h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / STB_QUESTIONS.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-[#202538]">
              {STB_QUESTIONS[currentQuestion].question}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={playQuestion}
                disabled={isPlaying}
                className="p-2 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] disabled:opacity-50"
              >
                {isPlaying ? '🔊' : '🔊'}
              </button>
              <span className="text-sm text-gray-500">
                Max {STB_QUESTIONS[currentQuestion].maxWords} words
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>ARL Level:</strong> {STB_QUESTIONS[currentQuestion].arlLevel} | 
              <strong> Evidence Mapping:</strong> {STB_QUESTIONS[currentQuestion].evidenceMapping}
            </p>
          </div>
        </div>

        {/* Voice Recording Interface */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-[#05585F] text-white hover:bg-[#00A29D]'
              }`}
            >
              {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
            </button>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Language:</span>
              <select className="border border-gray-300 rounded px-2 py-1">
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Your Answer:</h4>
              <p className="text-gray-700">{transcript}</p>
              <div className="mt-2 text-sm text-gray-500">
                {transcript.split(' ').length} words
              </div>
            </div>
          )}

          {/* Normalized Answer Display */}
          {Object.keys(normalizedAnswer).length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Normalized Answer:</h4>
              <div className="space-y-2">
                {Object.entries(normalizedAnswer).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-green-800 w-32">{key}:</span>
                    <span className="text-green-700">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Links */}
          {evidenceLinks.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Evidence Links:</h4>
              <div className="space-y-2">
                {evidenceLinks.map((link, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">Slide {link.slideNumber}:</span>
                    <span className="ml-2 text-yellow-800">"{link.textBlock}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {gaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Missing Information:</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {gaps.map((gap, index) => (
                  <li key={index}>• {gap}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        
        <div className="flex space-x-4">
          <button
            onClick={() => onSave(answers)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Save Draft
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={!transcript}
            className="px-6 py-3 bg-[#05585F] text-white rounded-lg hover:bg-[#00A29D] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestion === STB_QUESTIONS.length - 1 ? 'Complete Interview' : 'Next →'}
          </button>
        </div>
      </div>

      {/* Current Answer Summary */}
      {currentAnswer && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Answer:</h4>
          <p className="text-sm text-gray-700">{currentAnswer.answer}</p>
        </div>
      )}
    </div>
  )
}
