import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { lessons } from "../../data/courseData.js";

// --- Helper Components for Icons ---
const CheckIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>;
const CircleIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="9"/></svg>;
const ArrowRightIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>;

// --- Main Component ---
export default function LessonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Transcript, 3: Quiz

  const lesson = lessons.find((l) => l.id === id);

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-4">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Lesson Not Found</h1>
        <button onClick={() => navigate("/student-dashboard")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition transform hover:-translate-y-1">
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  const handleNextStep = () => {
    if (currentStep === 3) {
      navigate(`/assessment/${lesson.id}`);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const nextStepText = {
    1: "View Transcript",
    2: "Start Quiz",
    3: "Take the Quiz Now"
  };

  const LessonStep = ({ step, title, currentStep, setCurrentStep }) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;
    return (
      <button onClick={() => setCurrentStep(step)} className={`flex items-start text-left w-full p-4 rounded-lg transition ${isActive ? 'bg-blue-100' : 'hover:bg-slate-100'}`}>
        <div className={`flex items-center justify-center w-7 h-7 mr-4 rounded-full ${isCompleted ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
          {isCompleted ? <CheckIcon/> : step}
        </div>
        <div>
          <h4 className={`font-bold ${isActive ? 'text-blue-700' : 'text-slate-800'}`}>{title}</h4>
          <p className="text-sm text-slate-500">{isActive ? 'Current Step' : isCompleted ? 'Completed' : 'Pending'}</p>
        </div>
      </button>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header user={{ name: "Sanjana Chavan", role: "Student" }} currentLanguage={language} onLanguageChange={setLanguage} />

      <main className="container mx-auto px-4 py-8 flex-grow">
    {/* --- Dynamic Gradient Hero --- */}
    <div className="relative bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 rounded-2xl shadow-2xl overflow-hidden mb-8">
        <div className="relative z-10">
            <button onClick={() => navigate('/student-dashboard')} className="font-semibold text-blue-200 hover:text-white transition mb-4">
                &larr; Back to Dashboard
            </button>
            <p className="font-semibold text-blue-300">{lesson.subject} • Grade {lesson.grade}</p>
            <h1 className="text-4xl lg:text-5xl font-bold mt-2 mb-4">{lesson.title}</h1>
        </div>
        {/* The icon element that was here has been removed */}
    </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Learning Path */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-lg h-fit">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Your Learning Path</h3>
                <div className="space-y-2">
                    <LessonStep step={1} title="Lesson Details" currentStep={currentStep} setCurrentStep={setCurrentStep} />
                    <LessonStep step={2} title="View Transcript" currentStep={currentStep} setCurrentStep={setCurrentStep} />
                    <LessonStep step={3} title="Take The Quiz" currentStep={currentStep} setCurrentStep={setCurrentStep} />
                </div>
            </div>

            {/* Right Column: Content & Actions */}
            <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white p-8 rounded-2xl shadow-lg">
                    {currentStep === 1 && (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">What You'll Learn</h3>
                             <ul className="space-y-2 text-slate-600 list-disc list-inside">
                                <li>Understand the core concepts of {lesson.subject}.</li>
                                <li>Apply these concepts to solve practical problems.</li>
                                <li>Build a strong foundation for future lessons.</li>
                            </ul>
                            <hr className="my-6" />
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Description</h3>
                            <p className="text-slate-600 leading-relaxed">{lesson.description}</p>
                        </div>
                    )}
                    {currentStep === 2 && (
                         <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Lesson Transcript</h3>
                            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans bg-slate-50 p-4 rounded-lg border max-h-96 overflow-y-auto">
                                {lesson.transcript}
                            </pre>
                        </div>
                    )}
                    {currentStep === 3 && (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-4">Ready for the Quiz?</h3>
                            <p className="text-slate-600 leading-relaxed">
                                You've reviewed the lesson details and the transcript. Now it's time to test your knowledge!
                                Click the button below to start the quiz. Good luck!
                            </p>
                        </div>
                    )}
                 </div>
                 
                 <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-lg">
                    <div>
                        <p className="text-slate-500">Next Step</p>
                        <h4 className="font-bold text-lg text-slate-800">{nextStepText[currentStep]}</h4>
                    </div>
                    <button onClick={handleNextStep} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition transform hover:-translate-y-1 hover:shadow-xl">
                        <span>{currentStep === 3 ? "Start Quiz" : "Continue"}</span>
                        <ArrowRightIcon/>
                    </button>
                 </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}