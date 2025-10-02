import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import Button from "../../components/ui/button"
import Header from "../../components/Header.jsx"
import { PlusCircle } from "lucide-react"

// Mock Data
const mockClasses = [
  { id: 1, name: "Grade 6 - Science", students: 32, progress: 75 },
  { id: 2, name: "Grade 5 - Mathematics", students: 28, progress: 40 },
  { id: 3, name: "Grade 6 - History", students: 30, progress: 90 },
]

const TeacherClasses = () => {
  const [klasses] = useState(mockClasses)

  return (
    <div>
      <Header
        title="Teacher Dashboard"
        description={`Welcome back, Samiksha`}
      />
      <div className="min-h-screen bg-slate-50 p-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Classes</h1>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle className="h-4 w-4" /> Create Class
          </Button>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {klasses.map((klass) => (
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
                  <Button className="text-sm bg-blue-500 text-blue-800 hover:bg-blue-100">
                    Grade Assignments
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TeacherClasses
