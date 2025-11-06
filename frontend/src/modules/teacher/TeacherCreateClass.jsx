import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { useNavigate } from "react-router-dom";

const TeacherCreateClass = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const gradeLevels = [
    "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
    "Grade 11", "Grade 12", "College"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/teacher/classes', { name, description, gradeLevel });
      if (res?.data?.class) {
        setName("");
        setDescription("");
        setGradeLevel("");
        navigate('/teacher-dashboard');
      }
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
        <Link to="/teacher-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Create Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Class Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., Science Class A" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Grade Level <span className="text-red-500">*</span></label>
                  <select 
                    value={gradeLevel} 
                    onChange={(e) => setGradeLevel(e.target.value)} 
                    required 
                    className="mt-1 w-full border rounded-md px-3 py-2"
                  >
                    <option value="">Select a grade level</option>
                    {gradeLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Optional details" />
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">{loading ? 'Creating...' : 'Create Class'}</Button>
                  <Button type="button" variant="secondary" onClick={() => navigate('/teacher-classes')}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default TeacherCreateClass;


