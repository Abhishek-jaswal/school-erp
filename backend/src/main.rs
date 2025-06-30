mod models;
mod auth;
mod routes;
mod middleware;

use axum::Router;
use dotenvy::dotenv;
use std::env;
use sqlx::postgres::PgPoolOptions;
use routes::routes;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL not set");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    let app = routes().with_state(pool);

    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], 5000));
    println!("Backend running on http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
