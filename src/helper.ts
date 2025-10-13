import { goto } from "$app/navigation";
import { user_logged_in } from "@src/store.js";

export async function get_logged_user() {
  try {
    const res = await fetch("/api/method/frappe.auth.get_logged_user", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log(data);

    if (data?.message) {
      user_logged_in.set(true);
    } else {
      user_logged_in.set(false);
    }

    return data;
  } catch (err: any) {
    return null;
  }
}

export async function logout() {
  try {
    const res = await fetch("/api/method/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    console.log(data);
    user_logged_in.set(false);

    goto("/");

    return data;
  } catch (err: any) {
    console.error(err);

    return null;
  }
}

export function deleteAllCookies() {}

export async function login_verify(phone: number, pwd: string) {
  try {
    const res = await fetch("/api/method/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usr: phone + "",
        pwd: pwd,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error(err);

    return null;
  }
}
