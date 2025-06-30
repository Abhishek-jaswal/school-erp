use axum::{
    Json, Router,
    routing::{post, get},
    extract::State,
};
use serde_json::json;
use sqlx::PgPool;
use bcrypt::{verify, hash};

use crate::models::{LoginInput, LoginResponse, RegisterInput};
use crate::auth::create_jwt;
use crate::middleware::AuthUser;

pub fn routes() -> Router<PgPool> {
    Router::new()
        .route("/login", post(login_handler))
        .route("/register", post(register_handler))
        .route("/me", get(protected_route))
        .route("/teachers", get(get_all_teachers))
        .route("/students", get(get_all_students))
        .route("/add-teacher", post(add_teacher))
        .route("/add-student", post(add_student))
        .route("/add-topic", post(add_topic))
        .route("/add-syllabus", post(add_syllabus))
        .route("/add-exam", post(add_exam))
        .route("/my-students", get(get_students_by_subject))
        .route("/raise-issue", post(raise_issue))
        .route("/syllabus", get(view_syllabus))
        .route("/exams", get(view_exams))
        .route("/start-exam/:id", post(start_exam))
        .route("/submit-exam", post(submit_exam))
        .route("/notifications", post(add_notification).get(get_notifications))

}
use crate::models::{NotificationInput, Notification};

async fn add_notification(
    State(db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<NotificationInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "admin" {
        return Err((403, "Only admin can send notifications".into()));
    }

    sqlx::query(
        "INSERT INTO notifications (content, created_at)
         VALUES ($1, CURRENT_TIMESTAMP)"
    )
    .bind(&payload.content)
    .execute(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(json!({ "message": "Notification sent" })))
}

async fn get_notifications(
    State(db): State<PgPool>,
    _user: AuthUser,
) -> Result<Json<Vec<Notification>>, (u16, String)> {
    let notifications = sqlx::query_as!(
        Notification,
        "SELECT id, content, created_at FROM notifications ORDER BY created_at DESC"
    )
    .fetch_all(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(notifications))
}


use crate::models::{SyllabusItem, ExamItem, SubmitExamInput};
use axum::extract::Path;

async fn view_syllabus(
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<SyllabusItem>>, (u16, String)> {
    if user.role != "student" {
        return Err((403, "Only students can view syllabus".into()));
    }

    let subject = sqlx::query_scalar::<_, String>(
        "SELECT subject FROM students WHERE id = $1"
    )
    .bind(&user.id)
    .fetch_one(&db)
    .await
    .map_err(|_| (500, "Could not find subject".into()))?;

    let items = sqlx::query_as!(
        SyllabusItem,
        "SELECT subject, syllabus FROM syllabus WHERE subject = $1",
        subject
    )
    .fetch_all(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(items))
}

async fn view_exams(
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<ExamItem>>, (u16, String)> {
    if user.role != "student" {
        return Err((403, "Only students can view exams".into()));
    }

    let subject = sqlx::query_scalar::<_, String>(
        "SELECT subject FROM students WHERE id = $1"
    )
    .bind(&user.id)
    .fetch_one(&db)
    .await
    .map_err(|_| (500, "Could not find subject".into()))?;

    let today = chrono::Local::now().naive_local().date();

    let exams = sqlx::query_as!(
        ExamItem,
        "SELECT id, date, duration, total_marks, questions
         FROM exams
         WHERE subject = $1 AND date >= $2",
        subject,
        today
    )
    .fetch_all(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(exams))
}

async fn start_exam(
    Path(id): Path<i32>,
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "student" {
        return Err((403, "Only students can start exam".into()));
    }

    let exam = sqlx::query_as!(
        ExamItem,
        "SELECT id, date, duration, total_marks, questions FROM exams WHERE id = $1",
        id
    )
    .fetch_optional(&db)
    .await
    .map_err(|_| (500, "DB error".into()))?;

    if let Some(exam) = exam {
        let today = chrono::Local::now().naive_local().date();
        if exam.date != today {
            return Err((403, "Exam not available today".into()));
        }

        Ok(Json(json!({
            "message": "You may start the exam",
            "questions": exam.questions,
            "duration": exam.duration,
            "total_marks": exam.total_marks
        })))
    } else {
        Err((404, "Exam not found".into()))
    }
}

async fn submit_exam(
    State(_db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<SubmitExamInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "student" {
        return Err((403, "Only students can submit exams".into()));
    }

    // In real world: store to submissions table
    println!(
        "Student {} submitted exam {} with answers: {:?}",
        user.id, payload.exam_id, payload.answers
    );

    Ok(Json(json!({
        "message": "Exam submitted successfully"
    })))
}


use crate::models::{TopicInput, SyllabusInput, ExamInput, IssueInput};

async fn add_topic(
    State(db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<TopicInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "teacher" {
        return Err((403, "Only teachers can add topics".into()));
    }

    sqlx::query(
        "INSERT INTO todays_topics (teacher_id, subject, topic, date) VALUES ($1, (
            SELECT subject FROM teachers WHERE id = $1
        ), $2, CURRENT_DATE)"
    )
    .bind(&user.id)
    .bind(&payload.topic)
    .execute(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(json!({ "message": "Topic added" })))
}

async fn add_syllabus(
    State(db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<SyllabusInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "teacher" {
        return Err((403, "Only teachers can add syllabus".into()));
    }

    sqlx::query(
        "INSERT INTO syllabus (teacher_id, subject, syllabus) VALUES ($1, (
            SELECT subject FROM teachers WHERE id = $1
        ), $2)"
    )
    .bind(&user.id)
    .bind(&payload.syllabus)
    .execute(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(json!({ "message": "Syllabus uploaded" })))
}

async fn add_exam(
    State(db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<ExamInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "teacher" {
        return Err((403, "Only teachers can schedule exams".into()));
    }

    sqlx::query(
        "INSERT INTO exams (teacher_id, subject, date, duration, total_marks, questions)
         VALUES ($1, (
             SELECT subject FROM teachers WHERE id = $1
         ), $2, $3, $4, $5)"
    )
    .bind(&user.id)
    .bind(&payload.date)
    .bind(&payload.duration)
    .bind(&payload.total_marks)
    .bind(&payload.questions)
    .execute(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(json!({ "message": "Exam scheduled" })))
}

async fn get_students_by_subject(
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<Student>>, (u16, String)> {
    if user.role != "teacher" {
        return Err((403, "Only teachers can view students".into()));
    }

    let subject = sqlx::query_scalar::<_, String>(
        "SELECT subject FROM teachers WHERE id = $1"
    )
    .bind(&user.id)
    .fetch_one(&db)
    .await
    .map_err(|_| (500, "Could not find subject".into()))?;

    let students = sqlx::query_as!(
        Student,
        "SELECT id, firstName, lastName, email, contact, subject
         FROM students WHERE subject = $1", subject
    )
    .fetch_all(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(students))
}

async fn raise_issue(
    State(db): State<PgPool>,
    user: AuthUser,
    Json(payload): Json<IssueInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    sqlx::query(
        "INSERT INTO issues (by_user_id, role, message, created_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)"
    )
    .bind(&user.id)
    .bind(&user.role)
    .bind(&payload.message)
    .execute(&db)
    .await
    .map_err(|e| (500, format!("DB error: {}", e)))?;

    Ok(Json(json!({ "message": "Issue raised" })))
}


use crate::models::{Teacher, Student};
use axum::extract::TypedHeader;
use axum::headers::authorization::Bearer;

async fn get_all_teachers(
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<Teacher>>, (u16, String)> {
    if user.role != "admin" {
        return Err((403, "Access denied".into()));
    }

    let rows = sqlx::query_as!(
        Teacher,
        "SELECT id, firstName, lastName, email, contact, subject FROM teachers"
    )
    .fetch_all(&db)
    .await
    .map_err(|_| (500, "DB error".into()))?;

    Ok(Json(rows))
}

async fn get_all_students(
    State(db): State<PgPool>,
    user: AuthUser,
) -> Result<Json<Vec<Student>>, (u16, String)> {
    if user.role != "admin" {
        return Err((403, "Access denied".into()));
    }

    let rows = sqlx::query_as!(
        Student,
        "SELECT id, firstName, lastName, email, contact, subject FROM students"
    )
    .fetch_all(&db)
    .await
    .map_err(|_| (500, "DB error".into()))?;

    Ok(Json(rows))
}

async fn add_teacher(
    State(db): State<PgPool>,
    Json(payload): Json<RegisterInput>,
    user: AuthUser,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "admin" {
        return Err((403, "Only admin can add teachers".into()));
    }

    let hashed_password = hash(&payload.password, 4)
        .map_err(|_| (500, "Failed to hash password".into()))?;

    sqlx::query(
        "INSERT INTO teachers (
            id, firstName, lastName, email, contact, address,
            aadharNumber, alternateNumber, education, subject, password
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)"
    )
    .bind(&payload.id)
    .bind(&payload.firstName)
    .bind(&payload.lastName)
    .bind(&payload.email)
    .bind(&payload.contact)
    .bind(&payload.address)
    .bind(&payload.aadharNumber)
    .bind(&payload.alternateNumber)
    .bind(&payload.education)
    .bind(&payload.subject)
    .bind(&hashed_password)
    .execute(&db)
    .await
    .map_err(|err| (500, format!("DB error: {}", err)))?;

    Ok(Json(json!({ "message": "Teacher added" })))
}

async fn add_student(
    State(db): State<PgPool>,
    Json(payload): Json<RegisterInput>,
    user: AuthUser,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    if user.role != "admin" {
        return Err((403, "Only admin can add students".into()));
    }

    let hashed_password = hash(&payload.password, 4)
        .map_err(|_| (500, "Failed to hash password".into()))?;

    sqlx::query(
        "INSERT INTO students (
            id, firstName, lastName, email, contact, address,
            aadharNumber, alternateNumber, education, subject, password
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)"
    )
    .bind(&payload.id)
    .bind(&payload.firstName)
    .bind(&payload.lastName)
    .bind(&payload.email)
    .bind(&payload.contact)
    .bind(&payload.address)
    .bind(&payload.aadharNumber)
    .bind(&payload.alternateNumber)
    .bind(&payload.education)
    .bind(&payload.subject)
    .bind(&hashed_password)
    .execute(&db)
    .await
    .map_err(|err| (500, format!("DB error: {}", err)))?;

    Ok(Json(json!({ "message": "Student added" })))
}


async fn login_handler(
    State(db): State<PgPool>,
    Json(payload): Json<LoginInput>,
) -> Result<Json<LoginResponse>, (u16, String)> {
    let table = match payload.role.as_str() {
        "teacher" => "teachers",
        "student" => "students",
        _ => return Err((400, "Invalid role".into())),
    };

    let row = sqlx::query_as::<_, (String,)>(
        &format!("SELECT password FROM {} WHERE id = $1", table)
    )
    .bind(&payload.id)
    .fetch_optional(&db)
    .await
    .map_err(|_| (500, "DB error".into()))?;

    if let Some((hashed_password,)) = row {
        let valid = verify(&payload.password, &hashed_password)
            .map_err(|_| (500, "Hash error".into()))?;

        if valid {
            let token = create_jwt(&payload.id, &payload.role);
            Ok(Json(LoginResponse { token }))
        } else {
            Err((401, "Invalid password".into()))
        }
    } else {
        Err((404, "User not found".into()))
    }
}

async fn register_handler(
    State(db): State<PgPool>,
    Json(payload): Json<RegisterInput>,
) -> Result<Json<serde_json::Value>, (u16, String)> {
    let table = match payload.role.as_str() {
        "teacher" => "teachers",
        "student" => "students",
        _ => return Err((400, "Invalid role".into())),
    };

    // hash the password
    let hashed_password = hash(&payload.password, 4)
        .map_err(|_| (500, "Failed to hash password".into()))?;

    let query = format!(
        "INSERT INTO {} (
            id, firstName, lastName, email, contact, address,
            aadharNumber, alternateNumber, education, subject, password
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", table
    );

    let result = sqlx::query(&query)
        .bind(&payload.id)
        .bind(&payload.firstName)
        .bind(&payload.lastName)
        .bind(&payload.email)
        .bind(&payload.contact)
        .bind(&payload.address)
        .bind(&payload.aadharNumber)
        .bind(&payload.alternateNumber)
        .bind(&payload.education)
        .bind(&payload.subject)
        .bind(&hashed_password)
        .execute(&db)
        .await;

    match result {
        Ok(_) => Ok(Json(json!({ "message": "User registered successfully" }))),
        Err(err) => Err((500, format!("DB Error: {}", err))),
    }
}

async fn protected_route(user: AuthUser) -> Json<serde_json::Value> {
    Json(json!({
        "message": "Hello from protected route!",
        "user_id": user.id,
        "role": user.role
    }))
}
