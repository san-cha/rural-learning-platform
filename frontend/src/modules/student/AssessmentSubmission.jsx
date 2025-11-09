import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "../../api/axiosInstance.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Button from "../../components/ui/Button.jsx";
import { 
  CheckCircle, 
  ArrowLeft, 
  Clock,
  FileText,
  Loader,
  AlertCircle,
  Upload,
  Download,
  PlayCircle,
  File
} from "lucide-react";

export default function AssessmentSubmission() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Data states
  const [content, setContent] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch content metadata using the secure endpoint
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/student/content/${assessmentId}`);
        setContent(res.data.content);
        setSubmission(res.data.submission);

      } catch (err) {
        console.error("Error fetching content:", err);
        setError(err.response?.data?.msg || "Could not load assignment details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [assessmentId]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        setTimeout(() => setError(null), 3000);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  // Handle file submission
  const handleFileSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Please select a file to submit.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('submissionFile', selectedFile);

      const res = await axios.post(
        `/student/assessment/${assessmentId}/submit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSubmission(res.data.submission);
      setSuccessMessage("Assignment submitted successfully!");
      setSelectedFile(null);
      
      // Refresh the page data
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (err) {
      console.error("Error submitting file:", err);
      setError(err.response?.data?.msg || "Could not submit file. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate to quiz taking page
  const handleStartQuiz = () => {
    navigate(`/assessment/${assessmentId}`);
  };

  // Handle unsubmit (Google Classroom style)
  const handleUnsubmit = async () => {
    if (!window.confirm('Are you sure you want to unsubmit this assignment? You can submit again later.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await axios.delete(`/student/assessment/${assessmentId}/unsubmit`);
      setSubmission(null);
      setSuccessMessage("Assignment unsubmitted successfully. You can submit again.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error unsubmitting:", err);
      setError(err.response?.data?.msg || "Could not unsubmit assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h1 className="text-2xl font-semibold text-gray-700">Loading Assignment...</h1>
      </div>
    );
  }

  // Error state
  if (error && !content) {
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

  const isQuizAssignment = content?.assignmentType === 'manual-quiz';
  const isFileAssignment = content?.assignmentType === 'file';

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
              {submission.grade !== undefined && submission.grade !== null ? (
                <span className="font-bold text-green-600">
                  Grade: {submission.grade}%
                </span>
              ) : (
                <span className="text-gray-500 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Submitted
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Error Message */}
        {error && content && (
          <div className="flex items-center gap-3 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="flex items-center gap-3 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg mb-6 shadow-sm">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{successMessage}</span>
          </div>
        )}

        {/* Assignment Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <FileText className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{content?.title}</h1>
              {content?.description && (
                <p className="text-gray-600 leading-relaxed">{content.description}</p>
              )}
            </div>
          </div>

          {/* Assignment Info */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Type: <strong>{isQuizAssignment ? 'Quiz' : isFileAssignment ? 'File Upload' : 'Assignment'}</strong></span>
            </div>
            {content?.dueDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <span>Due: <strong>{new Date(content.dueDate).toLocaleDateString()}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* QUIZ ASSIGNMENT - Show Start Quiz Button */}
        {isQuizAssignment && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-4">
                <PlayCircle className="w-12 h-12 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Ready to Take the Quiz?</h2>
              {content.quizData?.questions && (
                <p className="text-gray-600 mb-6">
                  This quiz contains {content.quizData.questions.length} questions.
                </p>
              )}
              
              {!submission ? (
                <Button
                  onClick={handleStartQuiz}
                  className="bg-indigo-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-lg"
                >
                  Start Quiz
                </Button>
              ) : (
                <div className="space-y-4">
                  {submission.grade !== undefined && submission.grade !== null ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-900 mb-2">Quiz Completed!</h3>
                      <p className="text-2xl font-bold text-green-700">
                        Your Score: {submission.score || 0} / {submission.totalScore || 0}
                      </p>
                      <p className="text-xl text-gray-700 mt-2">
                        Grade: {submission.grade}%
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                      <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-blue-900 mb-2">Quiz Submitted</h3>
                      <p className="text-gray-700">Your teacher is reviewing your answers.</p>
                    </div>
                  )}
                  <Button
                    onClick={handleStartQuiz}
                    className="bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View Quiz
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FILE ASSIGNMENT - Show Materials and Upload Form */}
        {isFileAssignment && (
          <div className="space-y-6">
            {/* Materials Section - Teacher's Files */}
            {content.contentURLs && content.contentURLs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="w-6 h-6 text-blue-600" />
                  Materials from Teacher
                </h2>
                <div className="space-y-3">
                  {content.contentURLs.map((url, index) => {
                    const fileName = url.split('/').pop() || `File ${index + 1}`;
                    const fileExtension = fileName.split('.').pop()?.toLowerCase();
                    
                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <File className="w-8 h-8 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{fileName}</p>
                          <p className="text-sm text-gray-500">{fileExtension?.toUpperCase()} file</p>
                        </div>
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Your Work Section - File Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-indigo-600" />
                Your Work
              </h2>

              {submission ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-3" />
                    <h3 className="text-lg font-bold text-green-900 mb-2">Assignment Submitted</h3>
                    {submission.textSubmission && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 mb-2">Submitted file:</p>
                        <a
                          href={submission.textSubmission}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <File className="w-4 h-4" />
                          View your submission
                        </a>
                      </div>
                    )}
                    {submission.grade !== undefined && submission.grade !== null && (
                      <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-2xl font-bold text-green-700 mb-2">
                          Grade: {submission.grade}%
                        </p>
                        {submission.feedback && (
                          <div className="mt-3">
                            <h4 className="font-semibold text-gray-900 mb-2">Teacher Feedback:</h4>
                            <p className="text-gray-700 leading-relaxed">{submission.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}
                    {(submission.grade === undefined || submission.grade === null) && (
                      <p className="text-gray-700 mt-2">Your teacher will review and grade your work soon.</p>
                    )}
                  </div>

                  {/* Unsubmit Button - Google Classroom style */}
                  {submission.grade === undefined || submission.grade === null ? (
                    <Button
                      onClick={handleUnsubmit}
                      disabled={isSubmitting}
                      className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin inline" />
                          Processing...
                        </>
                      ) : (
                        'Unsubmit Assignment'
                      )}
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-500 text-center">
                      Cannot unsubmit graded assignments
                    </p>
                  )}
                </div>
              ) : (
                <form onSubmit={handleFileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Upload your assignment file:
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 file:cursor-pointer cursor-pointer border-2 border-gray-300 rounded-lg p-3"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      />
                    </div>
                    {selectedFile && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <File className="w-4 h-4" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-gray-400">
                          ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Accepted formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedFile || isSubmitting}
                    className="w-full bg-indigo-600 text-white font-bold py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 mr-2 animate-spin inline" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2 inline" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Materials (Non-assignment) - Just show as read-only */}
        {content?.contentType === 'material' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="prose prose-lg max-w-none">
              {content.content && (
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              )}
              {content.filePath && (
                <div className="mt-6">
                  <a
                    href={content.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Download Material
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
