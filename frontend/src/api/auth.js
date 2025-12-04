// src/api/auth.js
import api from "./api.js";

export async function loginWithEmail(email, password) {
  const res = await api.post("/auth/login/", {
    username: email,
    password,
  });
  return res.data;
}

export async function registerWithEmail(name, email, password) {
  const res = await api.post("/auth/register/", {
    username: email,
    email,
    password,
    first_name: name,
  });
  return res.data;
}

export function logoutUser() {

  return Promise.resolve();
}