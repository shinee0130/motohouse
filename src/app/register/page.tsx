"use client";

// /register тусдаа хуудас БИШ — нүүр рүү чиглүүлж, бүртгүүлэх modal-ыг нээнэ.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/lib/authModal";

export default function RegisterPage() {
  const router = useRouter();
  const authModal = useAuthModal();
  useEffect(() => {
    authModal.open("register");
    router.replace("/");
  }, [authModal, router]);
  return null;
}
