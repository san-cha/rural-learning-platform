import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Clock,
  FileText,
  Loader,
  AlertCircle
} from "lucide-react";

export default function Assessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  // Fetch assessment (full data including quiz questions)
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/student/assessment/${assessmentId}`);
        setAssessment(res.data);

        // Check if student already submitted
        try {
          const submissionRes = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/student/assessment/${assessmentId}/submission`);
          if (submissionRes?.data?.submission) {
            setSubmissionData(submissionRes.data.submission);
            setShowResults(true);
            
            // Populate answers from submission
            if (submissionRes.data.submission.answers) {
              const answerMap = {};
              submissionRes.data.submission.answers.forEach((ans, idx) => {
                answerMap[idx] = ans;
              });
              setAnswers(answerMap);
            }
          }
        } catch (submissionErr) {
          // No submission yet, that's okay
          console.log("No existing submission");
        }

      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError(err.response?.data?.msg || "Could not load quiz.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Handle answer selection
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!assessment || !assessment.quizData?.questions) return;

    // Validate all questions answered
    const unanswered = assessment.quizData.questions.some((_, idx) => answers[idx] === undefined);
    if (unanswered) {
      setError("Please answer all questions before submitting.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const answerArray = assessment.quizData.questions.map((_, idx) => answers[idx]);
      
      const res = await axios.post(`/student/assessment/${assessmentId}/submit`, {
        answers: JSON.stringify(answerArray)
      });

      setSubmissionData(res.data.submission);
      setShowResults(true);

    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.response?.data?.msg || "Could not submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700">Loading Quiz...</h1>
      </div>
    );
  }

  // Error state
  if (error && !assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  const questions = assessment?.quizData?.questions || [];

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          {submissionData && (
            <div className="flex items-center gap-2 text-sm">
              {submissionData.score !== undefined ? (
                <span className="font-bold text-green-600">
                  Score: {submissionData.score}/{submissionData.totalScore || questions.length}
                </span>
              ) : (
                <span className="text-gray-500 font-medium">Submitted</span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Temporary Error Message */}
        {error && assessment && (
          <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Quiz Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assessment?.title}</h1>
              {assessment?.description && (
                <p className="text-gray-600 leading-relaxed">{assessment.description}</p>
              )}
            </div>
          </div>

          {/* Quiz Info */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Type: <strong>Quiz</strong></span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span>{questions.length} Questions</span>
            </div>
          </div>
        </div>

        {/* QUIZ QUESTIONS */}
        <div className="space-y-6">
          {questions.map((question, qIdx) => {
            const userAnswer = answers[qIdx];
            const isCorrect = showResults && userAnswer === question.correctAnswer;
            const isWrong = showResults && userAnswer !== undefined && userAnswer !== question.correctAnswer;

            return (
              <div key={qIdx} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                    {qIdx + 1}
                  </span>
                  <p className="text-lg font-semibold text-gray-900 leading-relaxed flex-1">
                    {question.question}
                  </p>
                </div>

                <div className="space-y-3 ml-11">
                  {question.options.map((option, optIdx) => {
                    const isSelected = userAnswer === optIdx;
                    const isCorrectOption = showResults && optIdx === question.correctAnswer;

                    return (
                      <label
                        key={optIdx}
                        className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer
                          ${isSelected && !showResults ? 'border-indigo-500 bg-indigo-50' : ''}
                          ${isCorrectOption ? 'border-green-500 bg-green-50' : ''}
                          ${isWrong && isSelected ? 'border-red-500 bg-red-50' : ''}
                          ${!isSelected && !isCorrectOption && !showResults ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50' : ''}
                          ${showResults ? 'cursor-default' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${qIdx}`}
                          value={optIdx}
                          checked={isSelected}
                          onChange={() => handleAnswerChange(qIdx, optIdx)}
                          disabled={showResults}
                          className="w-5 h-5 text-indigo-600 cursor-pointer disabled:cursor-default"
                        />
                        <span className="flex-1 text-gray-800">{option}</span>
                        {isCorrectOption && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                        {isWrong && isSelected && (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Submit Button for Quiz */}
          {!showResults && (
            <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
              <p className="text-gray-600">
                Make sure you've answered all questions before submitting.
              </p>
              <Button
                onClick={handleQuizSubmit}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin inline" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
          )}

          {/* Results Display */}
          {showResults && submissionData && (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
              <p className="text-xl text-gray-700 mb-6">
                Your Score: <span className="font-bold text-green-600">
                  {submissionData.score} / {submissionData.totalScore || questions.length}
                </span>
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Grade: <span className="font-bold">{submissionData.grade}%</span>
              </p>
              <Button
                onClick={() => navigate(-1)}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Class
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
