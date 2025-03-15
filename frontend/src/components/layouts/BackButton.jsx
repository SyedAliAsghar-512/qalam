import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <>
    <button onClick={() => navigate(-1)} style={{background: "none", float: "left", width: "50px", marginRight: "5px"}}>
    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" style={{fontSize: "20px", color: "grey"}} />
    </button>
    </>
  );
};

export default BackButton;
