use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LoginInput {
    pub id: String,
    pub password: String,
    pub role: String,
}

#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
}

#[derive(Deserialize)]
pub struct RegisterInput {
    pub id: String,
    pub firstName: String,
    pub lastName: String,
    pub email: String,
    pub contact: String,
    pub address: String,
    pub aadharNumber: String,
    pub alternateNumber: String,
    pub education: String,
    pub subject: String,
    pub password: String,
    pub role: String, // "teacher" or "student"
}

#[derive(Serialize)]
pub struct Teacher {
    pub id: String,
    pub firstName: String,
    pub lastName: String,
    pub email: String,
    pub contact: String,
    pub subject: String,
}

#[derive(Serialize)]
pub struct Student {
    pub id: String,
    pub firstName: String,
    pub lastName: String,
    pub email: String,
    pub contact: String,
    pub subject: String,
}

#[derive(Deserialize)]
pub struct TopicInput {
    pub topic: String,
}

#[derive(Deserialize)]
pub struct SyllabusInput {
    pub syllabus: String,
}

#[derive(Deserialize)]
pub struct ExamInput {
    pub date: String,
    pub duration: i32,
    pub total_marks: i32,
    pub questions: serde_json::Value,
}

#[derive(Deserialize)]
pub struct IssueInput {
    pub message: String,
}

#[derive(Serialize)]
pub struct SyllabusItem {
    pub subject: String,
    pub syllabus: String,
}

#[derive(Serialize)]
pub struct ExamItem {
    pub id: i32,
    pub date: chrono::NaiveDate,
    pub duration: i32,
    pub total_marks: i32,
    pub questions: serde_json::Value,
}

#[derive(Deserialize)]
pub struct SubmitExamInput {
    pub exam_id: i32,
    pub answers: serde_json::Value,
}

#[derive(Deserialize)]
pub struct NotificationInput {
    pub content: String,
}

#[derive(Serialize)]
pub struct Notification {
    pub id: i32,
    pub content: String,
    pub created_at: chrono::NaiveDateTime,
}
