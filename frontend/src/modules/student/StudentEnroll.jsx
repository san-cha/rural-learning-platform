import { useState } from 'react';
import Header from '../../components/Header.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import axios from '../../api/axiosInstance.jsx';
import { Link, useNavigate } from 'react-router-dom';

const StudentEnroll = () => {
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post('/student/enroll', { classId });
      if (res?.data?.success) {
        setSuccess('Enrolled successfully');
        setClassId('');
        navigate('/student-dashboard');
      }
    } catch (e) {
      setError(e?.response?.data?.msg || 'Failed to enroll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Student" description="Enroll in a class" />
      <div className="container mx-auto px-4 py-6">
        <Link to="/student-dashboard" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="mt-4 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Enroll in Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Class ID</label>
                  <input value={classId} onChange={(e) => setClassId(e.target.value)} required className="mt-1 w-full border rounded-md px-3 py-2" placeholder="Paste class ID" />
                </div>
                {error && <div className="text-sm text-red-600">{error}</div>}
                {success && <div className="text-sm text-green-600">{success}</div>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">{loading ? 'Enrolling...' : 'Enroll'}</Button>
                  <Button type="button" variant="secondary" onClick={() => navigate('/student-dashboard')}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentEnroll;






