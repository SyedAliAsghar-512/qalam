import mongoose from "mongoose";
import Jwt from "jsonwebtoken";

const StudentSchema = new mongoose.Schema({
    student_info: {
        name: String,
        student_id: { type: String, unique: true },
        campus: String,
        status: String
    },
    dashboard: {
        academic_standings: {
            cgpa: Number,
            earned_credits: Number,
            total_credits: Number,
            inprogress_credits: Number
        },
        classes: [
            {
                course_name: String,
                instructor: String,
                course_code: String,
                credits: Number,
                attendance: String,
                semester: String,
                href: String
            }
        ],
        news_announcements: [
            {
                title: String,
                date: String
            }
        ],
        results: [
            {
                course_name: String,
                category: String, // e.g., "Quiz 15.0 %", "Mid Term 25.0 %"
                assessment: String, // e.g., "Quiz 1", "Mid Term 1"
                max_mark: String, // e.g., "10.0"
                obtained_marks: String, // e.g., "8.00"
                class_average: String, // e.g., "5.45"
                percentage: String // e.g., "80.00"
            }
        ],
        today_classes: [
            {
                subject: String,
                start_time: String,
                end_time: String
            }
        ]
    }
});

StudentSchema.methods.getJwtToken = function () {
    return Jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

export default mongoose.model("Student", StudentSchema);
