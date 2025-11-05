import { useState } from "react";
import Header from "../../components/Header.jsx";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { useNavigate } from "react-router-dom";

const TeacherCreateClass = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post('/teacher/classes', { name, description });
      if (res?.data?.class) {
        setName("");
        setDescription("");
        navigate('/teacher-dashboard');
      }
    } catch (e) {
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Teacher Dashboard" description="Create a new class" />
      <div className="container mx-auto px-4 py-6">
        <Link to="/teacher-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="mt-4 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Create Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Class Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="e.g., Grade 6 - Science" />
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
    </div>
  );
};

export default TeacherCreateClass;


