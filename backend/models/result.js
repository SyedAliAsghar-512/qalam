const resultSchema = new mongoose.Schema({
    course_name: String,
    category: String, // e.g., Quiz 15.0%
    assessment: String, // e.g., Quiz 1
    max_mark: Number,
    obtained_marks: Number,
    class_average: Number,
    percentage: Number
});

export default mongoose.model("result", resultSchema)