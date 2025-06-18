'use client'

import { useRouter } from "next/navigation";
import Mainpage from "./components/dashboard/Mainpage";
import { useEffect, useState } from "react";
import Loading from "./components/main/Loading";
import socket from "@/libs/socket";
export default function Home() {
  const [uesr, setuser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // للتحقق من الاتصال
    socket.on("connect", () => {
      console.log("✅ السيرفر شغال زي الفل - Socket ID:", socket.id);
  });

  // للتحقق من الأخطاء
  socket.on("connect_error", (error) => {
      console.error("❌ خطأ في الاتصال:", error.message);
  });





    const usersession = sessionStorage.getItem("User")
    if (usersession) {
      setuser(JSON.parse(usersession))
      setIsLoading(false)
    } else {
      router.push('/login')
    }
  }, [router])

  if (isLoading) {
    return <Loading />
  } else {


    return (
      <Mainpage />
    );
  }
}
