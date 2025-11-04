import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/Header.jsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";

const TeacherGrades = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [klass, setKlass] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get('/teacher/classes');
        if (!isActive) return;
        const list = Array.isArray(res?.data?.classes) ? res.data.classes : [];
        const found = list.find(c => c?._id === id);
        setKlass(found || null);
      } catch (e) {
        if (!isActive) return;
        setError('Failed to load class');
        setKlass(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetch();
    return () => { isActive = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Teacher Dashboard" description="View Grades" />
      <div className="container mx-auto px-4 py-6">
        <a href="/teacher-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</a>
        <div className="mt-4">
          {loading && <div>Loading...</div>}
          {error && !loading && <div className="text-red-600 text-sm">{error}</div>}
          {!loading && klass && (
            <Card>
              <CardHeader>
                <CardTitle>{klass?.name || 'Unnamed Class'}</CardTitle>
                <CardDescription>{klass?.description || ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Enrolled Students</h3>
                <div className="space-y-2">
                  {(Array.isArray(klass?.enrolledStudents) ? klass.enrolledStudents : []).map((s) => (
                    <div key={s?._id} className="flex items-center justify-between rounded border p-3">
                      <div className="text-sm">{s?.userId?.name || 'Student'}</div>
                      <div className="text-xs text-slate-500">No grades yet</div>
                    </div>
                  ))}
                  {(!klass?.enrolledStudents || klass.enrolledStudents.length === 0) && (
                    <div className="text-sm text-slate-500">No students enrolled yet.</div>
                  )}
                </div>
                <div className="mt-4">
                  <Button variant="secondary" onClick={() => navigate('/teacher-classes')}>Back to Classes</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherGrades;


