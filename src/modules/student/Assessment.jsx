import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessments } from '../../data/assessmentData'; // Updated path
import Header from '../../components/Header'; // Updated path

// --- Icons ---
const CheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircle = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const TrophyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3M5.636 5.636l-1.414-1.414M19.778 19.778l-1.414-1.414M18.364 5.636l-1.414 1.414M4.222 19.778l1.414-1.414M12 12a6 6 0 100-12 6 6 0 000 12z" /></svg>;


export default function Assessment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const quiz = assessments[id];

    if (!quiz) {
        return <div>Assessment not found.</div>;
    }

    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Last question, so show results
            setShowResults(true);
        }
    };
    
    const calculateScore = () => {
        return quiz.questions.reduce((score, question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                return score + 1;
            }
            return score;
        }, 0);
    };

    const score = calculateScore();
    const totalQuestions = quiz.questions.length;
    const currentQuestion = quiz.questions[currentQuestionIndex];

    // --- Results View ---
    if (showResults) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl text-center">
                    <TrophyIcon className="mx-auto" />
                    <h1 className="text-3xl font-bold text-slate-800 mt-4">Quiz Completed!</h1>
                    <p className="text-slate-600 mt-2">You have completed the {quiz.title}.</p>
                    <div className="my-8">
                        <p className="text-lg font-medium">Your Score</p>
                        <p className="text-5xl font-bold text-blue-600">{score} / {totalQuestions}</p>
                    </div>
                    <button 
                        onClick={() => navigate('/student-dashboard')}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition transform hover:-translate-y-1 hover:shadow-xl"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- Quiz View ---
    return (
        <div className="min-h-screen bg-slate-100">
            <Header user={{ name: "Sanjana Chavan" }} currentLanguage="en" />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
                    {/* Progress Bar and Header */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-2xl font-bold text-slate-800">{quiz.title}</h2>
                            <p className="font-semibold text-slate-600">Question {currentQuestionIndex + 1}<span className="text-slate-400">/{totalQuestions}</span></p>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}></div>
                        </div>
                    </div>

                    <hr className="my-8" />

                    {/* Question */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-700">{currentQuestion.question}</h3>
                        <div className="mt-6 space-y-4">
                            {currentQuestion.options.map((option) => {
                                const isSelected = selectedAnswers[currentQuestionIndex] === option;
                                return (
                                    <button 
                                        key={option}
                                        onClick={() => handleAnswerSelect(currentQuestionIndex, option)}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition text-lg font-medium ${
                                            isSelected ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300' : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    {/* Next Button */}
                    <div className="mt-8 text-right">
                        <button
                            onClick={handleNext}
                            disabled={!selectedAnswers[currentQuestionIndex]}
                            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 transform hover:-translate-y-1"
                        >
                            {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
