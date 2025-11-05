import { useEffect, useState } from "react";
import Header from "../../components/Header.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { Link } from "react-router-dom";

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get('/teacher/notifications');
      setNotifications(Array.isArray(res?.data?.notifications) ? res.data.notifications : []);
    } catch (e) {
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const markRead = async (id) => {
    try {
      await axios.post(`/teacher/notifications/${id}/read`);
      setNotifications((prev) => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Teacher Dashboard" description="Notifications" />
      <div className="container mx-auto px-4 py-6">
        <Link to="/teacher-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="mt-4">
          {loading && <div>Loading...</div>}
          {error && !loading && <div className="text-red-600 text-sm">{error}</div>}
          {!loading && (
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Array.isArray(notifications) ? notifications : []).map((n) => (
                  <div key={n._id} className={`flex items-start justify-between rounded border p-3 ${n.read ? '' : 'bg-blue-50 border-blue-200'}`}>
                    <div>
                      <div className="font-medium">{n.title}</div>
                      <div className="text-sm text-slate-600">{n.message}</div>
                    </div>
                    {!n.read && (
                      <Button size="sm" variant="secondary" onClick={() => markRead(n._id)}>Mark Read</Button>
                    )}
                  </div>
                ))}
                {Array.isArray(notifications) && notifications.length === 0 && (
                  <div className="text-sm text-slate-500">No notifications.</div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherNotifications;


