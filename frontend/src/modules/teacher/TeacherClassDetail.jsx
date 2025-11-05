import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { PlusCircle, FileText, Users, Calendar } from "lucide-react";

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentType, setAssignmentType] = useState("file");

  useEffect(() => {
    let isActive = true;
    const fetchClassDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/teacher/classes/${classId}`);
        if (!isActive) return;
        setClassData(res?.data?.class || null);
      } catch (e) {
        if (!isActive) return;
        setError("Failed to load class details");
        setClassData(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchClassDetails();
    return () => { isActive = false; };
  }, [classId]);

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/teacher-classes" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Classes
          </Link>
          <h1 className="text-2xl font-bold">
            {loading ? "Loading..." : classData?.name || "Class Details"}
          </h1>
          {classData?.description && (
            <p className="text-sm text-muted-foreground mt-1">{classData.description}</p>
          )}
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          onClick={() => setShowAssignmentForm(!showAssignmentForm)}
        >
          <PlusCircle className="h-4 w-4" /> Create New Assignment
        </Button>
      </div>

      {error && !loading && <div className="text-red-600 text-sm">{error}</div>}

      {showAssignmentForm && (
        <AssignmentCreationForm
          classId={classId}
          assignmentType={assignmentType}
          setAssignmentType={setAssignmentType}
          onSuccess={() => {
            setShowAssignmentForm(false);
            // Refresh class data
            window.location.reload();
          }}
          onCancel={() => setShowAssignmentForm(false)}
        />
      )}

      {!loading && classData && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Student Roster */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Student Roster
              </CardTitle>
              <CardDescription>
                {classData.enrolledStudents?.length || 0} enrolled students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(Array.isArray(classData.enrolledStudents) ? classData.enrolledStudents : []).map((student) => (
                  <div key={student._id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">
                        {student?.userId?.name || "Unknown Student"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student?.userId?.email || ""}
                      </p>
                    </div>
                  </div>
                ))}
                {(!classData.enrolledStudents || classData.enrolledStudents.length === 0) && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No students enrolled yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignments List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" /> Assignments
              </CardTitle>
              <CardDescription>
                {classData.assignments?.length || 0} assignments created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(Array.isArray(classData.assignments) ? classData.assignments : []).map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => navigate(`/teacher-grades/${assignment._id}`)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {assignment.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {assignment.submissions?.length || 0} submissions
                        </span>
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/teacher-grades/${assignment._id}`);
                      }}
                    >
                      Grade
                    </Button>
                  </div>
                ))}
                {(!classData.assignments || classData.assignments.length === 0) && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No assignments yet. Create one to get started!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Assignment Creation Form Component
const AssignmentCreationForm = ({ classId, assignmentType, setAssignmentType, onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: 0 }]);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("assignmentType", assignmentType);
      if (dueDate) formData.append("dueDate", dueDate);
      
      if (assignmentType === "file") {
        if (!file) {
          setError("Please select a file to upload");
          setLoading(false);
          return;
        }
        formData.append("file", file);
      } else if (assignmentType === "manual-quiz") {
        formData.append("quizData", JSON.stringify({ questions: quizQuestions }));
      } else if (assignmentType === "text-to-quiz") {
        if (!rawText.trim()) {
          setError("Please enter text content");
          setLoading(false);
          return;
        }
        formData.append("rawText", rawText);
      }

      const res = await axios.post(`/teacher/classes/${classId}/assignments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.assignment) {
        onSuccess();
      }
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Assignment</CardTitle>
        <CardDescription>Choose the type of assignment you want to create</CardDescription>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload File (Image or PDF) *</label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                required
                className="w-full border rounded-md px-3 py-2"
              />
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Question {qIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                      required
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Enter question"
                    />
                  </div>
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

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating..." : "Create Assignment"}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherClassDetail;

