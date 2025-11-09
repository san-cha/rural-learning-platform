import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance.jsx";
import Button from "../../components/ui/Button.jsx";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Clock,
  FileText,
  Loader,
  AlertCircle,
  Download,
  File,
  Users,
  Check,
  X,
  Eye
} from "lucide-react";

export default function TeacherAssignmentSubmissions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  // Data states
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [summary, setSummary] = useState(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gradingMode, setGradingMode] = useState(null); // { studentId, grade, feedback }

  // Fetch assignment submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/teacher/assignments/${assignmentId}/submissions`);
        setAssignment(res.data.assignment);
        setSubmissions(res.data.students);
        setSummary(res.data.summary);

      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError(err.response?.data?.msg || "Could not load assignment submissions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [assignmentId]);

  // Handle grading submission
  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      await axios.put(`/teacher/submission/${submissionId}/grade`, {
        grade: parseInt(grade),
        feedback: feedback || ""
      });

      // Update local state
      setSubmissions(prev => prev.map(sub =>
        sub.submission?._id === submissionId
          ? {
              ...sub,
              grade: parseInt(grade),
              feedback: feedback || "",
              submission: {
                ...sub.submission,
                grade: parseInt(grade),
                feedback: feedback || "",
                gradedAt: new Date()
              }
            }
          : sub
      ));

      setGradingMode(null);
      setSummary(prev => ({
        ...prev,
        graded: prev.graded + 1
      }));

    } catch (err) {
      console.error("Error grading submission:", err);
      setError(err.response?.data?.msg || "Could not grade submission.");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700">Loading Submissions...</h1>
      </div>
    );
  }

  // Error state
  if (error) {
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

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Class</span>
          </button>
          <div className="text-sm text-gray-600">
            {summary?.turnedIn || 0} of {summary?.totalStudents || 0} submitted
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Assignment Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment?.title}</h1>
              {assignment?.description && (
                <p className="text-gray-600 leading-relaxed">{assignment.description}</p>
              )}
            </div>
          </div>

          {/* Assignment Stats */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>Class: {summary?.totalStudents || 0} students</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Turned In: {summary?.turnedIn || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span>Missing: {summary?.notSubmitted || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <Check className="w-4 h-4" />
              <span>Graded: {summary?.graded || 0}</span>
            </div>
            {assignment?.dueDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          {submissions.map((student) => (
            <div
              key={student.studentId}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    student.status === 'turned-in' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {student.status === 'turned-in' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{student.studentName}</h3>
                    <p className="text-sm text-gray-600">{student.studentEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {student.status === 'turned-in' ? (
                    <>
                      {student.grade !== null && student.grade !== undefined ? (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {student.grade}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-sm text-gray-600 mb-1">Submitted</div>
                          <div className="text-sm text-gray-500">
                            {student.submittedAt ? new Date(student.submittedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {/* View/Download Submission */}
                        {student.submission?.textSubmission && (
                          <a
                            href={student.submission.textSubmission}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* Grade Button */}
                        <Button
                          onClick={() => setGradingMode({
                            studentId: student.studentId,
                            grade: student.grade || '',
                            feedback: student.feedback || ''
                          })}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          {student.grade !== null && student.grade !== undefined ? 'Update Grade' : 'Grade'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 font-medium">Not submitted</div>
                  )}
                </div>
              </div>

              {/* Grading Modal */}
              {gradingMode?.studentId === student.studentId && (
                <div className="mt-6 pt-6 border-t">
                  <div className="max-w-md">
                    <h4 className="font-semibold text-gray-900 mb-4">Grade Submission</h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleGradeSubmission(
                          student.submission._id,
                          formData.get('grade'),
                          formData.get('feedback')
                        );
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Grade (0-100)
                        </label>
                        <input
                          type="number"
                          name="grade"
                          min="0"
                          max="100"
                          defaultValue={gradingMode.grade}
                          required
                          className="w-full border rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Feedback (Optional)
                        </label>
                        <textarea
                          name="feedback"
                          defaultValue={gradingMode.feedback}
                          rows="3"
                          className="w-full border rounded-md px-3 py-2"
                          placeholder="Add feedback for the student..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Save Grade
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setGradingMode(null)}
                          variant="secondary"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Students Yet</h3>
            <p className="text-gray-500">Students will appear here once they enroll in your class.</p>
          </div>
        )}
      </main>
    </div>
  );
}
