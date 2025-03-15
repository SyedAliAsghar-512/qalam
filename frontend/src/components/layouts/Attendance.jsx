import { useEffect } from "react"
import { useMyClassesQuery } from "../../redux/api/orderApi"
import Class from "./product/Classes"
import toast from "react-hot-toast"
import Attend from "./Attend"
import { useSelector } from "react-redux"

const Attendance = () => {

  const {user,isError, loading} = useSelector((state) => state.auth)


    useEffect(() => {
        if (isError) {
          toast.error(isError?.data?.message)
        }
      }, [isError])

    return(
        <>
       <h2 className="headings" style={{marginTop: "10px",marginBottom: "20px"}}>📅 Attendance</h2><hr></hr>
        <div className="attendance-container">
  {user.dashboard.classes.map((course, index) => (
    <>
    <div className="attendance-row" key={index}>
      <h2 className="headings"> {course.course_name}</h2>
      <p className="writing">{course.attendance} Attendance</p>
      <div className="progress-bar">
        <div className="fill" style={{ width: course.attendance }}></div>
      </div>
    </div>
    <hr></hr>
    </>
  ))}
</div>


               </>
    )
}

export default Attendance