import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useGetResultQuery } from "../../redux/api/productsApi";
import toast from "react-hot-toast";
import BackButton from "./BackButton";
import Loader from "./loader";

const Result = () => {
  const { courseName } = useParams();
  const { data, isLoading, error, isError } = useGetResultQuery(courseName);
  const [results, setResults] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message);
    }

    // Extract the course-specific results properly
    const extractedResults = data?.results?.[courseName] || {}; // Ensuring it's an object
    setResults(extractedResults);
  }, [isError, data, courseName]);

  const categories = ["Quiz", "Assignments", "Mid Term", "Final Term", "Lab Work"];

  // Function to filter & sort assessments properly
  const getSortedResults = (category) => {
    if (!results || Object.keys(results).length === 0) return [];

    return Object.entries(results)
      .filter(([key]) => key.startsWith(category)) // Match category keys (e.g., "Quiz 1", "Assignments 3")
      .flatMap(([, value]) => value) // Flatten the nested arrays into one array
      .sort((a, b) => {
        const numA = parseInt(a.assessment.match(/\d+/)?.[0]) || 0;
        const numB = parseInt(b.assessment.match(/\d+/)?.[0]) || 0;
        return numA - numB;
      });
  };

  if (isLoading) return <Loader />

  return (
    <>
      <BackButton /> 
      <h4 className="headings" style={{color: "grey",textAlign: "left", marginTop: "5px"}}>Results & Grades</h4>
      <hr></hr>
      <div className="container mx-auto p-6">
      <h3 className="headings" style={{color: "grey"}}>{courseName ? `Results for ${courseName}` : "All Results"}</h3>

      {isLoading ? (
        <p className="text-gray-500">Loading results...</p>
      ) : (
        categories.map((category) => {
          const categoryResults = getSortedResults(category);
          return categoryResults.length > 0 ? (
            <div key={category} className="mb-4 border p-3 rounded bg-white shadow-md"  style={{  boxShadow: "0 2px 5px rgba(0.2, 0.2, 0.2, 0.5)"}}>
              {/* Expandable Category Header */}
              <div
                className="flex justify-between items-center cursor-pointer p-3 bg-gray-200 rounded hover:bg-gray-300 transition"
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
              >
                <span className="font-semibold">{category}</span>
                <span style={{marginLeft: "10px"}}>{expandedCategory === category ? "▲" : "▼"}</span>
              </div>

              {/* Expandable Table */}
              {expandedCategory === category && (
  <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>No</th>
            <th>Max Mark</th>
            <th>Obtained Marks</th>
            <th>Class Average</th>
          </tr>
        </thead>
        <tbody>
          {categoryResults.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.max_mark || "N/A"}</td>
              <td>{item.obtained_marks || "N/A"}</td>
              <td>{item.class_average || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
)}

            </div>
          ) : (
            <p></p>
          );
        })
      )}
    </div>
    </>
  );
};

export default Result;
