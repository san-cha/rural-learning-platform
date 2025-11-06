import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { PlusCircle, FileText, Users, Calendar, BookOpen, Upload, Copy, Check } from "lucide-react";
import VideoPlayer from "../../components/VideoPlayer.jsx";

const TeacherClassDetail = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
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

      {showMaterialForm && (
        <MaterialUploadForm
          classId={classId}
          onSuccess={() => {
            setShowMaterialForm(false);
            // Refresh class data
            window.location.reload();
          }}
          onCancel={() => setShowMaterialForm(false)}
        />
      )}

      {!loading && classData && (
        <div className="space-y-6">
          {/* Enrollment Code Card */}
          {classData.enrollmentCode && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Enrollment Code
                </CardTitle>
                <CardDescription>
                  Share this code with students so they can enroll in this class
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white rounded-lg border-2 border-blue-300 px-4 py-3">
                    <code className="text-2xl font-bold text-blue-600 tracking-wider">
                      {classData.enrollmentCode}
                    </code>
                  </div>
                  <EnrollmentCodeCopyButton code={classData.enrollmentCode} />
                </div>
              </CardContent>
            </Card>
          )}
          
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
                          navigate(`/teacher-assignments/${assignment._id}`);
                        }}
                      >
                        View/Edit
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

          {/* Study Materials Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Study Materials
                  </CardTitle>
                  <CardDescription>
                    {classData.materials?.length || 0} materials uploaded
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowMaterialForm(!showMaterialForm)}
                >
                  <Upload className="h-4 w-4" /> Upload Material
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(Array.isArray(classData.materials) ? classData.materials : []).map((material) => (
                  <div
                    key={material._id}
                    className="rounded-lg border p-4 hover:bg-slate-50 transition-colors"
                  >
                    {material.type === "video" ? (
                      // Video Player Display
                      <div className="space-y-2">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{material.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded by {material.uploadedBy?.name || "Unknown"} • {new Date(material.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <VideoPlayer filePath={material.filePath} />
                      </div>
                    ) : (
                      // PDF/Image Display (existing layout)
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`p-2 rounded-lg ${
                            material.type === "pdf" ? "bg-red-100" :
                            "bg-blue-100"
                          }`}>
                            <FileText className={`h-4 w-4 ${
                              material.type === "pdf" ? "text-red-600" :
                              "text-blue-600"
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{material.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {material.type.toUpperCase()} • Uploaded by {material.uploadedBy?.name || "Unknown"} • {new Date(material.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={`${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}${material.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                {(!classData.materials || classData.materials.length === 0) && (
                  <div className="text-sm text-slate-500 text-center py-4">
                    No study materials uploaded yet.
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

// Material Upload Form Component
const MaterialUploadForm = ({ classId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pdf");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!file) {
      setError("Please select a file to upload");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("type", type);
      formData.append("file", file);

      const res = await axios.post(`/teacher/classes/${classId}/materials`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res?.data?.material) {
        onSuccess();
      }
    } catch (e) {
      setError(e?.response?.data?.msg || "Failed to upload material");
    } finally {
      setLoading(false);
    }
  };

  const getAcceptTypes = () => {
    if (type === "pdf") return "application/pdf";
    if (type === "image") return "image/*";
    if (type === "video") return "video/*";
    return "*/*";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Upload Study Material</CardTitle>
        <CardDescription>Upload PDF, Image, or Video files for your students</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full border rounded-md px-3 py-2"
              placeholder="Material title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setFile(null); // Reset file when type changes
              }}
              required
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload File *</label>
            <input
              type="file"
              accept={getAcceptTypes()}
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="w-full border rounded-md px-3 py-2"
            />
            {file && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Uploading..." : "Upload Material"}
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

// Enrollment Code Copy Button Component
const EnrollmentCodeCopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      onClick={handleCopy}
      variant="secondary"
      className="flex items-center gap-2"
      title="Copy enrollment code"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" /> Copied!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" /> Copy
        </>
      )}
    </Button>
  );
};

export default TeacherClassDetail;

