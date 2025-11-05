import Header from "../../components/Header.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import axios from "../../api/axiosInstance.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const StudentSettings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await axios.delete('/auth/delete-account');
      await logout();
    } catch (e) {
      await logout();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Student Dashboard" description="Settings" />
      <div className="container mx-auto px-4 py-6">
        <Link to="/student-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="mt-4 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" onClick={() => navigate('/student-dashboard')}>Edit Profile (coming soon)</Button>
              <Button variant="outline" onClick={logout}>Logout</Button>
              <Button className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSettings;






