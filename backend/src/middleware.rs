use axum::{
    async_trait,
    extract::{FromRequestParts},
    http::{request::Parts, StatusCode},
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::Deserialize;
use std::env;

#[derive(Debug, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub role: String,
    pub exp: usize,
}

pub struct AuthUser {
    pub id: String,
    pub role: String,
}

#[async_trait]
impl<S> FromRequestParts<S> for AuthUser
where
    S: Send + Sync,
{
    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, StatusCode> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .ok_or(StatusCode::UNAUTHORIZED)?
            .to_str()
            .map_err(|_| StatusCode::UNAUTHORIZED)?;

        if !auth_header.starts_with("Bearer ") {
            return Err(StatusCode::UNAUTHORIZED);
        }

        let token = auth_header.trim_start_matches("Bearer ");
        let secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

        let decoded = decode::<Claims>(
            token,
            &DecodingKey::from_secret(secret.as_bytes()),
            &Validation::default(),
        )
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

        Ok(AuthUser {
            id: decoded.claims.sub,
            role: decoded.claims.role,
        })
    }
}
