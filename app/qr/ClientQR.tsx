"use client";

import React, { useEffect, useState } from "react";

function getOrCreateMockUserId(): string {
  if (typeof window === "undefined") return "";
  const key = "hotmess-user-id";
  try {
    let id = localStorage.getItem(key);
    if (!id) {
      id = (crypto && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : String(Date.now()) + "-" + Math.floor(Math.random() * 1000000);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return "";
  }
}

export default function ClientQR() {
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    setUserId(getOrCreateMockUserId());
  }, []);

  if (!userId) {
    return <div>Loading…</div>;
  }

  return (
    <div>
      <p>Mock user id: {userId}</p>
      {/* TODO: render QR code for userId here */}
    </div>
  );
}
