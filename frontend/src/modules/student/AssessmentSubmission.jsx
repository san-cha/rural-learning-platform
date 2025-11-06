import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  AlertCircle,
  Save
} from "lucide-react";

export default function AssessmentSubmission() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [textAnswer, setTextAnswer] = useState('');
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch assessment and any existing submission
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [assessmentRes, submissionRes] = await Promise.all([
          axios.get(`/student/assessment/${assessmentId}`),
          axios.get(`/student/assessment/${assessmentId}/submission`).catch(() => null)
        ]);

        setAssessment(assessmentRes.data);
        
        if (submissionRes?.data?.submission) {
          setSubmission(submissionRes.data.submission);
          setShowResults(true);
          
          // If it's a quiz with answers, populate them
          if (submissionRes.data.submission.answers) {
            const answerMap = {};
            submissionRes.data.submission.answers.forEach((ans, idx) => {
              answerMap[idx] = ans;
            });
            setAnswers(answerMap);
          }
          
          // If it's a text submission
          if (submissionRes.data.submission.textSubmission) {
            setTextAnswer(submissionRes.data.submission.textSubmission);
          }
        }

      } catch (err) {
        console.error("Error fetching assessment:", err);
        setError(err.response?.data?.msg || "Could not load assessment.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessment();
  }, [assessmentId]);

  // Handle quiz answer selection
  const handleAnswerChange = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  // Handle quiz submission
  const handleQuizSubmit = async () => {
    if (!assessment || !assessment.questions) return;

    // Validate all questions answered
    const unanswered = assessment.questions.some((_, idx) => !answers[idx]);
    if (unanswered) {
      setError("Please answer all questions before submitting.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const answerArray = assessment.questions.map((_, idx) => answers[idx]);
      
      const res = await axios.post(`/student/assessment/${assessmentId}/submit`, {
        answers: answerArray
      });

      setSubmission(res.data.submission);
      setShowResults(true);

    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError(err.response?.data?.msg || "Could not submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle text assignment submission
  const handleTextSubmit = async () => {
    if (!textAnswer.trim()) {
      setError("Please write your answer before submitting.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(`/student/assessment/${assessmentId}/submit`, {
        textSubmission: textAnswer
      });

      setSubmission(res.data.submission);
      setShowResults(true);

    } catch (err) {
      console.error("Error submitting assignment:", err);
      setError(err.response?.data?.msg || "Could not submit assignment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700">Loading Assessment...</h1>
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

  const isQuiz = assessment?.assignmentType === 'quiz' || assessment?.questions?.length > 0;
  const isTextAssignment = !isQuiz;

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
            <span className="font-medium">Back to Class</span>
          </button>
          {submission && (
            <div className="flex items-center gap-2 text-sm">
              {submission.score !== undefined ? (
                <span className="font-bold text-green-600">
                  Score: {submission.score}/{submission.totalScore || assessment?.questions?.length || 0}
                </span>
              ) : (
                <span className="text-gray-500 font-medium">Submitted - Awaiting Grade</span>
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

        {/* Assessment Header */}
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

          {/* Assessment Info */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Type: <strong>{isQuiz ? 'Quiz' : 'Written Assignment'}</strong></span>
            </div>
            {isQuiz && (
              <div className="flex items-center gap-2 text-gray-600">
                <span>{assessment.questions.length} Questions</span>
              </div>
            )}
          </div>
        </div>

        {/* QUIZ CONTENT */}
        {isQuiz && (
          <div className="space-y-6">
            {assessment.questions.map((question, qIdx) => {
              const userAnswer = answers[qIdx];
              const isCorrect = showResults && userAnswer === question.correctAnswer;
              const isWrong = showResults && userAnswer && userAnswer !== question.correctAnswer;

              return (
                <div key={qIdx} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                      {qIdx + 1}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 leading-relaxed flex-1">
                      {question.questionText}
                    </p>
                  </div>

                  <div className="space-y-3 ml-11">
                    {question.options.map((option, optIdx) => {
                      const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D
                      const isSelected = userAnswer === optionLetter;
                      const isCorrectOption = showResults && optionLetter === question.correctAnswer;

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
                            value={optionLetter}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(qIdx, optionLetter)}
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
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </Button>
              </div>
            )}

            {/* Results Display */}
            {showResults && submission && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
                <p className="text-xl text-gray-700 mb-6">
                  Your Score: <span className="font-bold text-green-600">
                    {submission.score} / {submission.totalScore || assessment.questions.length}
                  </span>
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
        )}

        {/* TEXT ASSIGNMENT CONTENT */}
        {isTextAssignment && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {showResults ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Submission:</h3>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {submission.textSubmission || textAnswer}
                    </p>
                  </div>
                </div>

                {submission.grade !== undefined && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <h3 className="text-lg font-bold text-green-900">Graded</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-700 mb-2">
                      Grade: {submission.grade}%
                    </p>
                    {submission.feedback && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <h4 className="font-semibold text-gray-900 mb-2">Teacher Feedback:</h4>
                        <p className="text-gray-700 leading-relaxed">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {submission.grade === undefined && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                    <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Submitted Successfully</h3>
                    <p className="text-gray-700">Your teacher will review and grade your submission soon.</p>
                  </div>
                )}

                <Button
                  onClick={() => navigate(-1)}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Return to Class
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-3">
                    Your Answer:
                  </label>
                  <textarea
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-colors resize-none text-gray-800"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {textAnswer.length} characters
                  </p>
                </div>

                <Button
                  onClick={handleTextSubmit}
                  disabled={isSubmitting || !textAnswer.trim()}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin inline" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2 inline" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}