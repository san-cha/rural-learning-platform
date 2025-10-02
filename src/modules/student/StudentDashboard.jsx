import { useState } from "react";
import  Header from "../../components/Header.jsx";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");

  // Mock data
  const student = {
    name: "Sanjana Chavan",
    role: "Student",
    grade: "5",
    completedLessons: 12,
    totalLessons: 20,
    weeklyProgress: 75,
  };

  const lessons = [
    {
      id: "1",
      title: "Introduction to Mathematics",
      description:
        "Learn basic arithmetic and number concepts through interactive audio lessons.",
      duration: 480,
      subject: "Mathematics",
      grade: "5",
      isCompleted: true,
      progress: 100,
    },
    {
      id: "2",
      title: "Parts of Plants",
      description: "Explore different parts of plants and their functions.",
      duration: 360,
      subject: "Science",
      grade: "5",
      isCompleted: false,
      progress: 60,
    },
    {
      id: "3",
      title: "Village Stories",
      description: "Listen to traditional stories from rural communities.",
      duration: 600,
      subject: "Language",
      grade: "5",
      isCompleted: false,
      progress: 0,
    },
  ];

  const completionPercentage = Math.round(
    (student.completedLessons / student.totalLessons) * 100
  );

  const handleLessonClick = (lesson) => {
    navigate(`/lesson/${lesson.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <Header
        user={{ name: "Sanjana Chavan", role: "Student" }}
        currentLanguage={language}
        onLanguageChange={setLanguage}
      />

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {student.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium">📚 Lessons Completed</h2>
            </div>
            <div className="text-xl font-bold">
              {student.completedLessons}/{student.totalLessons}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded mt-2">
              <div
                className="bg-green-500 h-2 rounded"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 bg-white shadow rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium">⏳ Weekly Progress</h2>
            </div>
            <div className="text-xl font-bold">{student.weeklyProgress}%</div>
            <p className="text-xs text-gray-500">Great progress this week!</p>
          </div>
        </div>

        {/* Lessons Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📖</span>
            <h2 className="text-xl font-semibold">Your Lessons</h2>
            <span className="ml-auto text-sm px-2 py-1 border rounded">
              Grade {student.grade}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="p-4 bg-white shadow rounded-xl hover:shadow-md transition cursor-pointer"
                onClick={() => handleLessonClick(lesson)}
              >
                <h3 className="font-semibold text-lg">{lesson.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {lesson.description}
                </p>
                <div className="mt-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      lesson.isCompleted ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {lesson.isCompleted ? "Completed ✅" : "In Progress ⏳"}
                  </span>
                  <div className="w-full bg-gray-200 h-2 rounded mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
