import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../Header.jsx";

export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Mock lesson data
  const lesson = {
    id: id || "1",
    title: "Introduction to Mathematics",
    description:
      "Learn basic arithmetic and number concepts through interactive audio lessons. This comprehensive lesson covers addition, subtraction, and number recognition using practical examples from daily life.",
    duration: 480,
    subject: "Mathematics",
    grade: "5",
    isCompleted: false,
    progress: 60,
    transcript: `Welcome to our mathematics lesson. Today we will learn about numbers and basic arithmetic operations. 

Numbers are everywhere around us - when we count animals, measure grains, or calculate money at the market.

Let's start with addition. When we add two numbers, we combine them together...`,
  };

  const handleDownload = () => {
    setIsDownloaded(true);
    alert("Lesson is being downloaded for offline viewing.");
  };

  const handleStartQuiz = () => {
    navigate(`/assessment/${lesson.id}`);
  };

  const handleReportIssue = () => {
    alert("Thank you for your feedback. We'll look into this.");
  };

  const handleTextToSpeech = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(lesson.description);
      utterance.lang = language === "hi" ? "hi-IN" : "en-US";
      speechSynthesis.speak(utterance);
      alert("Lesson description is being read aloud.");
    } else {
      alert("Text-to-speech is not supported on this device.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={{ name: "Sanjana Chavan", role: "Student" }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <button
          className="flex items-center gap-2 text-blue-600 mb-4"
          onClick={() => navigate(-1)}
        >
          🔙 Back to Lessons
        </button>

        {/* Lesson Header */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>📝 {lesson.subject}</span>
            <span>•</span>
            <span>Grade {lesson.grade}</span>
            <span>•</span>
            <span>{Math.floor(lesson.duration / 60)} mins</span>
          </div>
          <div className="flex gap-2 mt-2">
            <span
              className={`px-2 py-1 rounded ${
                lesson.isCompleted ? "bg-green-500 text-white" : "bg-yellow-500 text-white"
              }`}
            >
              {lesson.isCompleted ? "Completed ✅" : "In Progress ⏳"}
            </span>
            {isDownloaded && (
              <span className="px-2 py-1 rounded bg-blue-500 text-white">
                Downloaded 💾
              </span>
            )}
          </div>
        </div>

        {/* Description Card */}
        <div className="p-4 bg-white shadow rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Lesson Description</h2>
            <button
              className="text-sm bg-blue-100 px-2 py-1 rounded hover:bg-blue-200"
              onClick={handleTextToSpeech}
            >
              🔊 Read Aloud
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">{lesson.description}</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transcript */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 bg-white shadow rounded-xl">
              <h3 className="text-lg font-semibold mb-2">📄 Transcript</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {lesson.transcript}
              </pre>
            </div>
          </div>

          {/* Actions & Progress */}
          <div className="space-y-4">
            <div className="p-4 bg-white shadow rounded-xl space-y-2">
              <h3 className="font-semibold text-lg">Actions</h3>
              <button
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleStartQuiz}
              >
                ▶️ Start Quiz
              </button>
              {!isDownloaded && (
                <button
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  onClick={handleDownload}
                >
                  💾 Download for Offline
                </button>
              )}
              <button
                className="w-full border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
                onClick={handleReportIssue}
              >
                ⚠️ Report Issue
              </button>
            </div>

            <div className="p-4 bg-white shadow rounded-xl space-y-2">
              <h3 className="font-semibold text-lg">Your Progress</h3>
              <div className="flex justify-between text-sm">
                <span>Completion</span>
                <span className="font-medium">{lesson.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded">
                <div
                  className="bg-blue-500 h-2 rounded transition-all duration-300"
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-white shadow rounded-xl space-y-2">
              <h3 className="font-semibold text-lg">Next Lessons</h3>
              <div className="space-y-2 text-sm">
                <div className="p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  Basic Subtraction
                </div>
                <div className="p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  Number Patterns
                </div>
                <div className="p-2 rounded border hover:bg-gray-100 cursor-pointer">
                  Simple Word Problems
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
