import catchAsyncErrors from "../backend/middlewares/catchAsyncErrors.js"
import User from "../backend/models/user.js"
import ErrorHandler from "../backend/utils/errorHandler.js"
import sendToken from "../backend/utils/sendToken.js";
import sendEmail from "../backend/utils/sendEmail.js"
import {getResetPasswordTemplate} from "../backend/utils/emailTemplates.js"
import crypto from "crypto"
import {delete_file, upload_file} from "../backend/utils/cloudinary.js"
import bcrypt from "bcryptjs"
import puppeteer from "puppeteer"
import Student from "../backend/models/studentschema.js";
import { log } from "console";



//registeruser
export const registerUser = catchAsyncErrors(async (req, res , next) => {
const { name, email, password } = req.body;

 const user = await User.create({
    name,
    email,
    password,
});
sendToken(user, 200, res);
});

//loginuser
export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ErrorHandler("Username and Password is Required", 400));
    }

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch({ headless: false, args: ["--no-sandbox", "--disable-setuid-sandbox"] }); // Set to `true` in production
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
        );

        // Navigate to Qalam login page
        await page.goto("https://qalam.nust.edu.pk/web/login", { waitUntil: "domcontentloaded", timeout: 60000 });

        // Wait for login input fields
        await page.waitForSelector("input[name='login']", { timeout: 10000 });
        await page.waitForSelector("input[name='password']", { timeout: 10000 });

        // Enter credentials
        await page.type("input[name='login']", username, { delay: 100 });
        await page.type("input[name='password']", password, { delay: 100 });

        // Click login
  // ✅ Click login & wait for navigation
await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 120000 }),
    page.click("button[type='submit']")
]);

        // ✅ **Check the current URL after login**
        await new Promise(resolve => setTimeout(resolve, 5000));
        const currentUrl = await page.evaluate(() => window.location.href);
        console.log("Current URL:", currentUrl);

        // If URL contains "dashboard" → Successful login
        if (!currentUrl.includes("dashboard")) {
            await browser.close();
            return next(new ErrorHandler("Invalid Username or Password", 401));
        }

        // ✅ Extract session token (Optional)
        const cookies = await page.cookies();
        const sessionToken = cookies.find(cookie => cookie.name === "session_id")?.value;
        console.log("Session Token:", sessionToken);


        // ✅ Get dashboard data
        const dashboardData = await page.evaluate(() => document.body.innerText);

        // ✅ Extract Student Information
        const studentInfo = {
            name: dashboardData.match(/(\d+)\n([A-Za-z ]+)/)?.[2] || "Unknown",
            student_id: dashboardData.match(/(\d{11})/)?.[1] || "00000000000",
            campus: dashboardData.match(/NUST [A-Za-z ]+ Campus/)?.[0] || "Unknown",
            status: "NUST Student"
        };

        // ✅ Extract Academic Standings
        const academicStandings = {
            cgpa: parseFloat(dashboardData.match(/CGPA:\s+([\d.]+)/)?.[1]) || 0.0,
            earned_credits: parseFloat(dashboardData.match(/Earned Cr :\s+([\d.]+)/)?.[1]) || 0.0,
            total_credits: parseFloat(dashboardData.match(/Total Cr :\s+([\d.]+)/)?.[1]) || 0.0,
            inprogress_credits: parseFloat(dashboardData.match(/Inprogress Cr :\s+([\d.]+)/)?.[1]) || 0.0
        };

        // ✅ Extract Classes
// ✅ Extract Classes (Improved)
const classRegex = /([\w\s-]+)\n([\w\s]+)\n([\w-]+) Credits : ([\d.]+) Active Class\nAttendance: ([\d.]+)% Spring 2025/g;

const classes = [];
let match;

while ((match = classRegex.exec(dashboardData)) !== null) {
    // Extract course name (only the last part if split into multiple lines)
    const formattedCourseName = match[1].split("\n").pop().trim();

    classes.push({
        course_name: formattedCourseName, // Use only the correct part
        instructor: match[2].trim(),
        course_code: match[3].trim(),
        credits: parseFloat(match[4]) || 0,
        attendance: `${match[5]}%`,
        semester: "Spring 2025",
        href: "" // Placeholder for course links
    });

        }

        // ✅ Extract News Announcements
        const newsAnnouncements = Array.from(dashboardData.matchAll(/(.+)\n(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/g))
            .map(match => ({
                title: match[1].trim(),
                date: match[2].trim()
            }));

            await page.goto(" https://qalam.nust.edu.pk/student/results/", { waitUntil: "domcontentloaded", timeout: 60000 });

// Extract Course Links
// Extract Course Links
const resultData = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a")).map(link => ({
        text: link.innerText.trim(),
        href: link.href
    })).filter(item => 
        item.text && 
        item.href.includes("/student/course/gradebook/") // Only course links
    );
});

// ✅ Match Links with Courses (Using Course Name)
classes.forEach(course => {
    const matchingLink = resultData.find(link => 
        link.text.toLowerCase().includes(course.course_name.toLowerCase()) // Match by name
    );
    
    if (matchingLink) {
        course.href = matchingLink.href; // Store matched link
    }
});

const results = [];

for (const course of classes) {
    if (!course.href) continue;
    await page.goto(course.href, { waitUntil: "domcontentloaded", timeout: 60000 });

    // Expand rows to reveal assessments
    await page.evaluate(() => {
        document.querySelectorAll("tr[role='button']").forEach(row => row.click());
    });

    // Scrape results
    const scrapedResults = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("table tbody tr")).map(row => {
            const columns = row.querySelectorAll("td");
            return {
                category: columns[0]?.innerText.trim() || "",
                assessment: columns[1]?.innerText.trim() || "",
                max_mark: columns[2]?.innerText.trim() || "0",
                obtained_marks: columns[3]?.innerText.trim() || "0",
                class_average: columns[4]?.innerText.trim() || "0",
                percentage: columns[5]?.innerText.trim() || "0",
            };
        });
    });

    // Format and push results
    scrapedResults.forEach(result => {
        results.push({
            course_name: course.course_name,
            category: result.category.replace(/\s+/g, " ").trim(),
            assessment: result.assessment.trim(),
            max_mark: parseFloat(result.max_mark) || 0,
            obtained_marks: parseFloat(result.obtained_marks) || 0,
            class_average: parseFloat(result.class_average) || 0,
            percentage: parseFloat(result.percentage) || 0,
            semester: "Spring 2025"
        });
    });
}

function convertTo12Hour(hour, minute) {
    hour = parseInt(hour);
    let period = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // Convert 0 or 12 to 12
    return `${hour}:${minute} ${period}`;
}
// ✅ Extract Today's Classes
let todayClasses = [];
const classMatches = dashboardData.matchAll(/([A-Za-z ]+)\s*:\s*(\d{2}):(\d{2})\s*Hrs\.\s*-\s*(\d{2}):(\d{2})\s*Hrs\./g);

for (const match of classMatches) {
    let subject = match[1].trim();
    let startTime = convertTo12Hour(match[2], match[3]); // Convert start time
    let endTime = convertTo12Hour(match[4], match[5]);   // Convert end time

    todayClasses.push({ subject, start_time: startTime, end_time: endTime });
}

            await browser.close();

        // ✅ Store Student Data in Database
        const student = await Student.findOneAndUpdate(
            { "student_info.student_id": studentInfo.student_id }, // Find student by ID
            {
                $set: {
                    "student_info.name": studentInfo.name,
                    "student_info.student_id": studentInfo.student_id,
                    "student_info.campus": studentInfo.campus,
                    "student_info.status": studentInfo.status,
        
                    "dashboard.academic_standings": academicStandings,
                    "dashboard.classes": classes,
                    "dashboard.news_announcements": newsAnnouncements,
                    "dashboard.results": results,
                    "dashboard.today_classes": todayClasses // Store scraped results here
                }
            },
            { upsert: true, new: true } // Insert if not found, update otherwise
        );
        

sendToken(student, 200, res)
    } catch (error) {
        res.status(500).json({
            error: "Login failed",
            details: error.message,
        });
    }
});



//logoutuser
export const logoutUser = catchAsyncErrors(async (req, res , next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        message: "logged-out"
    })
})

//upload user avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
     
    const avatarResponse = await upload_file(req.body.avatar, "shopholic/avatar")

    if (req?.user?.avatar?.url) {
        await delete_file(req?.user?.avatar?.public_id)
    }

    const user = await User.findByIdAndUpdate(req?.user?._id, {
        avatar: avatarResponse,
    })

    res.status(200).json({
        user,
    })
})

//forgetpassworduser
export const forgetPassword = catchAsyncErrors(async (req, res , next) => {

const user = await User.findOne({ email: req.body.email });

if (!user ) {
    return next (new ErrorHandler("user not found with this email",404))
}

const resetToken = user.getResetPasswordToken();

//console.log("reset token (forgot)",resetToken)

await user.save();

const resetUrl = `${process.env.FRONTEND_URL}/api/v1/password/reset/${resetToken}`

const message = getResetPasswordTemplate(user?.name, resetUrl);

try {
   await sendEmail({
    email: user.email,
    subject: "Shopholic Password Recovery",
    message,
   })
   res.status(200).json({
    message: `email sent to: ${user.email}`
   })
}
catch (error) {
    user.resetPasswordToken =  undefined
    user.resetPasswordExpire = undefined

    await user.save()
    return next (new ErrorHandler(error?.message, 500))
}
});

//resetpassword
export const resetPassword = catchAsyncErrors(async (req, res , next) => {

    const token = req.params.token

    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    //console.log("reset token (reset)",resetPasswordToken)
   
    const user = await User.findOne({
       resetPasswordToken,
       resetPasswordExpire: { $gt : Date.now() }
    })
    if (!user ) {
       return next (new ErrorHandler("Password reset token is invalid or has been expired",401))
   }
   if (req.body.password !== req.body.confirmPassword) {
       return next (new ErrorHandler("Password does not match",400))
   }
   user.password = req.body.password
   
   user.resetPasswordToken =  undefined
   user.resetPasswordExpire = undefined
   
   await user.save()
   
   sendToken(user, 200, res);
   })

//getuserinfo
   export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findById(req?.user?._id)
    res.status(200).json({
        student,
    })
})

//Changepassword
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check previous user password
    const isMatched = await user.comparePassword(req.body.oldPassword)
    if (!isMatched) {
        return next(new ErrorHandler('Old password is incorrect'));
    }

    user.password = req.body.password;
    await user.save();

    sendToken(user, 200, res) 

})

// Update user profile   =>   /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        gmail: req.body.gmail,
        phoneno: req.body.phoneno,
        address: req.body.address
    }
    const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
        new: true
    })

    res.status(200).json({
        success: true,
        user
    })
})

// Get all users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})


// Get user details 
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Update user profile
export const updateUser = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true
    })

    res.status(200).json({
        success: true
    })
})

// Delete user
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`))
    }

    if(user?.avatar?.public_id) {
        await delete_file(user?.avatar?.public_id)
    }

    await user.remove();

    res.status(200).json({
        success: true,
    })
})

export const getResults = catchAsyncErrors(async (req, res, next) => { 
    try {
        const studentId = req?.user?.student_info?.student_id;
        const { courseName } = req.params;

        // Find student by ID
        const student = await Student.findOne({ "student_info.student_id": studentId });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Group results by course name and category, filtering out `%` categories
        const groupedResults = {};

        student.dashboard.results.forEach(result => {
            const course = result.course_name;
            const category = result.category;

            // **Skip categories that contain `%`**
            if (category.includes("%")) return;

            // **Skip empty fields**
            if (!result.assessment || !result.max_mark || !result.obtained_marks) return;

            // If a specific course is requested, skip others
            if (courseName && course !== courseName) return;

            if (!groupedResults[course]) {
                groupedResults[course] = {};
            }
            if (!groupedResults[course][category]) {
                groupedResults[course][category] = [];
            }

            groupedResults[course][category].push({
                max_mark: result.assessment,
                obtained_marks: result.max_mark,
                class_average: result.obtained_marks,
                percentage: result.class_average,
                assessment: result.percentage
            });
        });

        // **Sort Assessments Properly**
        Object.keys(groupedResults).forEach(course => {
            Object.keys(groupedResults[course]).forEach(category => {
                groupedResults[course][category].sort((a, b) => {
                    // Extract the last number (e.g., "Quiz 1", "Quiz 10")
                    const numA = parseInt(a.assessment.match(/\d+/)?.[0]) || 0;
                    const numB = parseInt(b.assessment.match(/\d+/)?.[0]) || 0;
                    return numA - numB; // Sort numerically
                });
            });
        });

        res.status(200).json({
            student_info: {
                name: student.student_info.name,
                student_id: student.student_info.student_id
            },
            results: groupedResults
        });

    } catch (error) {
        console.error("Error fetching results:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
