import React from "react"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"


const Results = () => {
    const {user, loading} = useSelector((state) => state.auth)

return (
    <>
          {/* Courses List */}
          <div className="courses-container">
          <h2 className="headings" style={{marginTop: "10px",marginBottom: "20px"}}>📚 Enrolled Courses</h2>
          <hr></hr>
          {user.dashboard.classes.map((course, index) => (
            <Link to = {`/result/${course.course_name}`} style={{textDecoration: "none", }}>
            <div className="course-card" key={index}>
              <h3 className="headings">{course.course_name}</h3>
              <p className="writing"><strong>Instructor:</strong> {course.instructor}</p>
              <p className="writing"><strong>Code:</strong> {course.course_code}</p>
              <p className="writing"><strong>Credits:</strong> {course.credits}</p>
              <p className="writing"><strong>Semester:</strong> {course.semester}</p>
            </div>
            </Link>
          ))}
        </div>
        </>
)
}

export default Results