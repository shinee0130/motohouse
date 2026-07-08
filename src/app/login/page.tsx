"use client";

// /login тусдаа хуудас БИШ — нүүр рүү чиглүүлж, нэвтрэх modal-ыг нээнэ.
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/lib/authModal";

export default function LoginPage() {
  const router = useRouter();
  const authModal = useAuthModal();
  useEffect(() => {
    authModal.open("login");
    router.replace("/");
  }, [authModal, router]);
  return null;
}
