import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card";
import Button from "../../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";
import {
  Users,
  PlusCircle,
  FileText,
  CheckSquare,
} from "lucide-react";

import axios from "../../api/axiosInstance.jsx";


const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    totalStudentsCount: 0,
    assignmentsToGradeCount: 0,
    uploadedContentCount: 0,
    activeClasses: [],
    recentContent: [],
  });

  // Fetch dashboard data
  useEffect(() => {
    let isActive = true;
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/teacher/dashboard-data");
        if (!isActive) return;
        setDashboardData({
          totalStudentsCount: res?.data?.totalStudentsCount || 0,
          assignmentsToGradeCount: res?.data?.assignmentsToGradeCount || 0,
          uploadedContentCount: res?.data?.uploadedContentCount || 0,
          activeClasses: Array.isArray(res?.data?.activeClasses) ? res.data.activeClasses : [],
          recentContent: Array.isArray(res?.data?.recentContent) ? res.data.recentContent : [],
        });
      } catch (e) {
        if (!isActive) return;
        setError("Failed to load dashboard data");
        setDashboardData({
          totalStudentsCount: 0,
          assignmentsToGradeCount: 0,
          uploadedContentCount: 0,
          activeClasses: [],
          recentContent: [],
        });
      } finally {
        if (isActive) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { isActive = false; };
  }, []);

  const handleCreateClass = () => {
    navigate('/teacher-create-class');
  };

  const handleCardClick = (route) => {
    navigate(route);
  };

  const handleClassClick = (classId) => {
    navigate(`/teacher-classes/${classId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
          {/* Overview Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
              <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2" onClick={handleCreateClass}>
                <PlusCircle className="h-4 w-4" /> Create New
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick('/teacher-classes')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.totalStudentsCount}</div>
                  <p className="text-xs text-muted-foreground">Across {dashboardData.activeClasses.length} active classes</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick('/teacher-grades/assignments-to-grade')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Assignments to Grade</CardTitle>
                  <CheckSquare className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.assignmentsToGradeCount}</div>
                  <p className="text-xs text-muted-foreground">Pending submissions</p>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                onClick={() => handleCardClick('/teacher-classes')}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Uploaded Content</CardTitle>
                  <FileText className="h-5 w-5 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardData.uploadedContentCount}</div>
                  <p className="text-xs text-muted-foreground">Total assignments and materials</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* My Classes */}
          <Card>
            <CardHeader>
              <CardTitle>My Active Classes</CardTitle>
              <CardDescription>An overview of your current classes and their progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && <div>Loading...</div>}
              {error && !loading && <div className="text-red-600 text-sm">{error}</div>}
              {(Array.isArray(dashboardData.activeClasses) ? dashboardData.activeClasses : []).map((klass) => (
                <div 
                  key={klass._id} 
                  className="flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-slate-50"
                  onClick={() => handleClassClick(klass._id)}
                >
                  <div>
                    <p className="font-medium">{klass?.name || "Unnamed Class"}</p>
                    <p className="text-sm text-muted-foreground">{klass?.studentCount || 0} Students</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-blue-600">0%</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              ))}
              {!loading && !error && Array.isArray(dashboardData.activeClasses) && dashboardData.activeClasses.length === 0 && (
                <div className="text-sm text-slate-500">No classes yet.</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Content */}
          <Card>
            <CardHeader>
              <CardTitle>My Recent Content</CardTitle>
              <CardDescription>A list of lessons and materials you've recently uploaded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && <div>Loading...</div>}
              {error && !loading && <div className="text-red-600 text-sm">{error}</div>}
              {(Array.isArray(dashboardData.recentContent) ? dashboardData.recentContent : []).map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    if (item.type === "Assignment") {
                      navigate(`/teacher-assignments/${item._id}`);
                    } else if (item.type === "Material") {
                      // Navigate to class detail page with materials section
                      navigate(`/teacher-classes/${item.classId}`);
                    }
                  }}
                >
                  <div className="flex-shrink-0">
                    {item.type === "Assignment" ? (
                      <FileText className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
              ))}
              {!loading && !error && Array.isArray(dashboardData.recentContent) && dashboardData.recentContent.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No recent content yet.</div>
              )}
            </CardContent>
          </Card>
    </div>
  );
};

export default TeacherDashboard;
