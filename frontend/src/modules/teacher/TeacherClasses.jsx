import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx"
import Button from "../../components/ui/Button.jsx"
import { PlusCircle } from "lucide-react"
import axios from "../../api/axiosInstance.jsx"

const TeacherClasses = () => {
  const navigate = useNavigate()
  const [klasses, setKlasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let isActive = true
    const fetchClasses = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await axios.get(`${import.meta.env.VITE_FRONTEND_URL}/teacher/classes`)
        if (!isActive) return
        const list = Array.isArray(res?.data?.classes) ? res.data.classes : []
        setKlasses(list.map(c => ({
          id: c?._id,
          name: c?.name || 'Unnamed Class',
          students: c?.enrolledStudents?.length || 0,
          progress: 0
        })))
      } catch (e) {
        if (!isActive) return
        setError('Failed to load classes')
        setKlasses([])
      } finally {
        if (isActive) setLoading(false)
      }
    }
    fetchClasses()
    return () => { isActive = false }
  }, [])

  const handleCreateClass = () => {
    navigate('/teacher-create-class')
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 overflow-auto">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Classes</h1>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700" onClick={handleCreateClass}>
            <PlusCircle className="h-4 w-4" /> Create Class
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading && <div>Loading...</div>}
          {error && !loading && <div className="text-red-600 text-sm">{error}</div>}
          {(Array.isArray(klasses) ? klasses : []).map((klass) => (
            <Card key={klass.id}>
              <CardHeader>
                <CardTitle>{klass.name}</CardTitle>
                <CardDescription>{klass.students} students enrolled</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-semibold text-blue-600">{klass.progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${klass.progress}%` }}
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to={`/teacher-classes/${klass.id}`}>
                    <Button className="text-sm bg-blue-500 text-blue-800 hover:bg-blue-100">
                      View Class
                    </Button>
                  </Link>
                  <Link to={`/teacher-grades/${klass.id}`}>
                    <Button className="text-sm bg-blue-500 text-blue-800 hover:bg-blue-100">
                      Grade Assignments
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && !error && Array.isArray(klasses) && klasses.length === 0 && (
            <div className="text-sm text-slate-500">No classes yet.</div>
          )}
        </div>
    </div>
  )
}

export default TeacherClasses
