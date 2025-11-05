import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { FileText, Calendar, Save } from "lucide-react";

const TeacherAssignmentEdit = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignmentType, setAssignmentType] = useState("file");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    let isActive = true;
    const fetchAssignment = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/teacher/assignments/${assignmentId}`);
        if (!isActive) return;
        const assignmentData = res?.data?.assignment;
        setAssignment(assignmentData);
        
        // Populate form fields
        setTitle(assignmentData.title || "");
        setDescription(assignmentData.description || "");
        setAssignmentType(assignmentData.assignmentType || "file");
        
        // Format due date for datetime-local input
        if (assignmentData.dueDate) {
          const date = new Date(assignmentData.dueDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          setDueDate(`${year}-${month}-${day}T${hours}:${minutes}`);
        } else {
          setDueDate("");
        }
        
        // Set quiz questions if they exist
        if (assignmentData.quizData?.questions && Array.isArray(assignmentData.quizData.questions)) {
          setQuizQuestions(assignmentData.quizData.questions);
        } else {
          setQuizQuestions([]);
        }
        
        // Set raw text if it's a text-to-quiz (though we don't store it, we can set empty)
        if (assignmentData.assignmentType === "text-to-quiz") {
          setRawText(""); // Will need to be re-entered
        }
      } catch (e) {
        if (!isActive) return;
        setError("Failed to load assignment details");
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchAssignment();
    return () => { isActive = false; };
  }, [assignmentId]);

  const handleAddQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    const updated = quizQuestions.filter((_, i) => i !== index);
    setQuizQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description || "");
      formData.append("assignmentType", assignmentType);
      
      // Handle due date
      if (dueDate && dueDate !== "") {
        formData.append("dueDate", new Date(dueDate).toISOString());
      } else {
        formData.append("dueDate", "");
      }
      
      // Handle different assignment types
      if (assignmentType === "file" && file) {
        formData.append("file", file);
      } else if (assignmentType === "manual-quiz") {
        // Ensure quizQuestions is properly structured
        const validQuestions = quizQuestions.filter(q => q.question && q.question.trim() !== "");
        if (validQuestions.length > 0) {
          formData.append("quizData", JSON.stringify({ questions: validQuestions }));
        } else {
          formData.append("quizData", JSON.stringify({ questions: [] }));
        }
      } else if (assignmentType === "text-to-quiz") {
        formData.append("rawText", rawText || "");
      }

      // Debug: Log the payload structure
      console.log("Submitting assignment update:", {
        title,
        description,
        assignmentType,
        dueDate,
        quizQuestionsCount: quizQuestions.length,
        hasFile: !!file,
        rawTextLength: rawText?.length || 0,
      });

      const res = await axios.put(`/teacher/assignments/${assignmentId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Update response:", res.data);

      if (res?.data?.assignment) {
        // Show success message briefly before redirect
        alert("Assignment updated successfully!");
        navigate(`/teacher-classes/${assignment.classId?._id || assignment.classId}`);
      }
    } catch (e) {
      console.error("Error updating assignment:", e);
      setError(e?.response?.data?.msg || e?.message || "Failed to update assignment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
        <div>Loading assignment details...</div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
        <div className="text-red-600">{error}</div>
        <Link to="/teacher-classes" className="text-blue-600 hover:underline">
          &larr; Back to Classes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link 
            to={`/teacher-classes/${assignment?.classId?._id || assignment?.classId}`} 
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            &larr; Back to Class
          </Link>
          <h1 className="text-2xl font-bold">Edit Assignment</h1>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {assignment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" /> Assignment Details
            </CardTitle>
            <CardDescription>
              Last edited: {assignment.lastEdited ? new Date(assignment.lastEdited).toLocaleString() : "Never"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Assignment Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Assignment Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="file"
                      checked={assignmentType === "file"}
                      onChange={(e) => setAssignmentType(e.target.value)}
                    />
                    File Upload (Image/PDF)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="manual-quiz"
                      checked={assignmentType === "manual-quiz"}
                      onChange={(e) => setAssignmentType(e.target.value)}
                    />
                    Manual Quiz
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="text-to-quiz"
                      checked={assignmentType === "text-to-quiz"}
                      onChange={(e) => setAssignmentType(e.target.value)}
                    />
                    Text-to-Quiz
                  </label>
                </div>
              </div>

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full border rounded-md px-3 py-2"
                  placeholder="Assignment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                  rows="3"
                  placeholder="Assignment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>

              {/* File Upload Type */}
              {assignmentType === "file" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Upload New File (Image or PDF) - Optional
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full border rounded-md px-3 py-2"
                  />
                  {assignment.contentURLs && assignment.contentURLs.length > 0 && !file && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Current file: {assignment.contentURLs[0]}
                    </p>
                  )}
                </div>
              )}

              {/* Manual Quiz Type */}
              {assignmentType === "manual-quiz" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700">Quiz Questions</label>
                    <Button type="button" variant="secondary" size="sm" onClick={handleAddQuestion}>
                      Add Question
                    </Button>
                  </div>
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-slate-700">
                          Question {qIndex + 1}
                        </label>
                        {quizQuestions.length > 1 && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRemoveQuestion(qIndex)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                        required
                        className="w-full border rounded-md px-3 py-2"
                        placeholder="Enter question"
                      />
                      <div className="space-y-2">
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === oIndex}
                              onChange={() => handleQuestionChange(qIndex, "correctAnswer", oIndex)}
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                              required
                              className="flex-1 border rounded-md px-3 py-2"
                              placeholder={`Option ${oIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizQuestions.length === 0 && (
                    <p className="text-sm text-muted-foreground">No questions yet. Click "Add Question" to get started.</p>
                  )}
                </div>
              )}

              {/* Text-to-Quiz Type */}
              {assignmentType === "text-to-quiz" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Paste Text Content *
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    required
                    className="w-full border rounded-md px-3 py-2"
                    rows="8"
                    placeholder="Paste your text content here. The system will automatically generate quiz questions from it."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The system will process this text and generate quiz questions automatically.
                  </p>
                </div>
              )}

              {/* Submission Info */}
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>{assignment.submissions?.length || 0}</strong> submissions received
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate(`/teacher-classes/${assignment.classId?._id || assignment.classId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherAssignmentEdit;

