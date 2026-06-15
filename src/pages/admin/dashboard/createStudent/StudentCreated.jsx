import { Check, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  encodeRecordId,
  findStudentById,
  getLastCreatedStudent,
  setSelectedStudentId,
} from "../../../../utils/learnupRecords.js";
import "./studentCreated.css";

export default function StudentCreated() {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { state } = useLocation();
  const student =
    findStudentById(studentId) ||
    findStudentById(state?.studentId) ||
    getLastCreatedStudent();

  const handleViewProfile = () => {
    if (!student) {
      navigate("/admin/student/profile");
      return;
    }

    setSelectedStudentId(student.id);
    navigate(`/admin/student/profile/${encodeRecordId(student.id)}`, {
      state: { studentId: student.id },
    });
  };

  return (
    <main className="student-created-page">
      <section className="student-created-card">
        <div className="student-created-check"><Check size={40} strokeWidth={3} /></div>
        <h1>Student Profile Created Successfully</h1>
        <p>The new student record has been saved and is now available across the admin and profile views.</p>

        <div className="student-created-info">
          <div><span>FULL NAME</span><strong>{student?.name || "New Student"}</strong></div>
          <div><span>STUDENT ID</span><strong>{student?.id || "Pending"}</strong></div>
          <div><span>DEPARTMENT</span><strong>{student?.department || "Pending"}</strong></div>
          <div><span>EMAIL</span><strong>{student?.email || "Pending"}</strong></div>
          <div><span>PHONE</span><strong>{student?.phone || "Not provided"}</strong></div>
          <div><span>GENDER</span><strong>{student?.gender || "Not provided"}</strong></div>
        </div>

        <div className="student-created-actions">
          <button type="button" onClick={handleViewProfile}>VIEW PROFILE</button>
          <button type="button" onClick={() => navigate("/admin/create-student")}>CREATE ANOTHER STUDENT</button>
        </div>
        <button type="button" className="student-created-return" onClick={() => navigate("/admin/create-student")}>
          <ChevronLeft size={16} /> RETURN TO STUDENTS TABLE
        </button>
      </section>
    </main>
  );
}
