import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assessments } from '../../data/assessmentData.js';
import Header from '../../components/Header.jsx';
import Footer from '../../components/Footer.jsx';

// --- Helper Icons ---
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default function Assessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quiz = assessments[id];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold">Quiz not found!</h1>
        <Link to="/student-dashboard" className="mt-4 text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleAnswerSelect = (questionIndex, answer) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answer,
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const score = Object.keys(selectedAnswers).reduce((acc, index) => {
    const question = quiz.questions[index];
    const selectedAnswer = selectedAnswers[index];
    if (question.correctAnswer === selectedAnswer) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const percentage = Math.round((score / quiz.questions.length) * 100);

  // --- Render Quiz View ---
  const renderQuiz = () => {
    const question = quiz.questions[currentQuestionIndex];
    const totalQuestions = quiz.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const selectedOption = selectedAnswers[currentQuestionIndex];

    return (
      <div className="w-full max-w-3xl mx-auto">
        {/* Progress Bar and Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-700">{quiz.title}</h2>
            <p className="text-slate-500 font-medium">
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </p>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <h3 className="text-2xl font-bold text-slate-800 mb-6">{question.question}</h3>
          <div className="space-y-4">
            {question.options.map((option, index) => {
                const isSelected = selectedOption === option;
                return (
                    <button
                        key={index}
                        onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 text-lg font-medium
                            ${isSelected 
                                ? 'bg-blue-500 border-blue-600 text-white shadow-lg' 
                                : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                    >
                        <span className={`mr-4 font-bold`}>{String.fromCharCode(65 + index)}.</span>
                        {option}
                    </button>
                )
            })}
          </div>
        </div>

        {/* Navigation Button */}
        <div className="mt-8 text-right">
            <button
                onClick={handleNextQuestion}
                disabled={!selectedOption}
                className="bg-blue-600 text-white font-bold py-3 px-10 rounded-lg transition transform hover:-translate-y-1 hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed disabled:transform-none"
            >
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
        </div>
      </div>
    );
  };
  
  // --- Render Results View ---
  const renderResults = () => (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl text-center">
        <h2 className="text-3xl font-extrabold text-slate-800">Quiz Completed!</h2>
        <div className="my-8">
            <p className="text-lg text-slate-600">Your Score:</p>
            <p className="text-7xl font-bold text-blue-600 my-2">{percentage}%</p>
            <p className="text-slate-500 font-medium">{score} out of {quiz.questions.length} correct</p>
        </div>
        <div className="space-y-4">
            <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
                Retake Quiz
            </button>
            <button onClick={() => navigate('/student-dashboard')} className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-lg hover:bg-slate-300 transition transform hover:-translate-y-1">
                Back to Dashboard
            </button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header user={{ name: "Sanjana Chavan" }} />
      <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
        {showResults ? renderResults() : renderQuiz()}
      </main>
      <Footer />
    </div>
  );
}