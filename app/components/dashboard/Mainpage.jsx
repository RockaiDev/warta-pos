'use client'
import React, { useEffect, useState } from 'react'
import ItemsPage from '../Items/ItemsPage'
import UsersPage from '../users/UsersPage'
import { useRouter } from 'next/navigation'
import Loading from '../main/Loading'
import BranchesList from '../branch/BranchesList'
import ToggleFullScreen from '../buttons/ToggleFullScreen'
import POSPage from '../POS/POSPage'
import ExpensesPage from '../expenses/ExpensesPage'
import DashboardPage from './DashboardPage'
<<<<<<< HEAD
import socket from '@/libs/socket'
=======
import WebOrdersPage from '../webOrder/WebOrderPage'
>>>>>>> farestest

export default function Mainpage() {
    const userData = sessionStorage.getItem("User")
    const [section, setSection] = useState(JSON.parse(userData).role === 'إدارة' ? "dashboard" : 'POS')
    const [openMenu, setOpenMenu] = useState(false)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [client,setClient] = useState()
    
    const allAccessRole = ["المالك", "المدير العام", "مدير فرع", "إدارة"]

// console.log(client.);

    const router = useRouter()

<<<<<<< HEAD
    useEffect(() => {
         // للتحقق من الاتصال
         socket.on("connect", () => {
            console.log("✅ السيرفر شغال زي الفل - Socket ID:", socket.id);
        });

        // للتحقق من الأخطاء
        socket.on("connect_error", (error) => {
            console.error("❌ خطأ في الاتصال:", error.message);
        });

        if (userData) {
            setUser(JSON.parse(userData))
            setIsLoading(false)
        }

        // Cleanup function
        return () => {
            socket.off("connect");
            socket.off("connect_error");
        };
    }, [userData])
=======
  useEffect(() => {
   
    if (userData) {
        setUser(JSON.parse(userData));
        setIsLoading(false);
    }
}, []);

>>>>>>> farestest

    const LogOut = () => {
        sessionStorage.clear()
        router.push('/login')
    }
    
    if (isLoading) {
        return <Loading />
    } else {
        return (
            <>
                <div onClick={() => setOpenMenu(!openMenu)} className={`showbtn duration-700 absolute top-5 right-6 ${openMenu ? 'text-bgColor' : 'text-mainColor'} z-50 cursor-pointer`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" /> </svg>
                </div>

                <section onClick={() => setOpenMenu(!openMenu)} className={`menu bg-mainColor h-full p-4 rounded-l-2xl flex flex-col items-center justify-between ${openMenu ? '' : 'translate-x-20'} absolute duration-700 z-40`}>
                    <div>

                    </div>
                    <div className="nav">
                        <ul>
                            {user.role === 'إدارة' ? null : (
                                <li className={`${section === 'POS' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('POS')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /> </svg></li>
                            )}
                            {allAccessRole.includes(user.role) && (
                                <>
                                    {user.role === 'إدارة' ? (
                                        <>
                                            <li className={`${section === 'dashboard' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('dashboard')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /> </svg></li>
                                            <li className={`${section === 'POS' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('POS')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" /> </svg></li>
                                        </>
                                    ) : (
                                        <>
                                            <li className={`${section === 'dashboard' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('dashboard')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /> </svg></li>
                                            <li className={`${section === 'Expenses' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('Expenses')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /> </svg></li>
                                            <li className={`${section === 'Items' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('Items')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" /></svg></li>
                                            <li className={`${section === 'Branches' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('Branches')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" /> </svg></li>
                                            <li className={`${section === 'WebOrders' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('WebOrders')}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
  <path d="M256 32C132.3 32 32 132.3 32 256s100.3 224 224 224 224-100.3 224-224S379.7 32 256 32zm0 48c15.3 0 30.2 1.8 44.6 5.1L160 248V93.4C184.1 63.1 218.6 48 256 48zm-96 365.3V296h117.3L160 413.3zm144-52.6V264H248L368.6 104c37.1 32.3 59.4 79.6 59.4 128 0 74.4-53.3 136.3-121 152.7z"/>
</svg>
</li>
                                            <li className={`${section === 'Users' ? "text-mainColor text-xl bg-bgColor" : "text-bgColor"} cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2`} onClick={() => setSection('Users')}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /> </svg></li>
                                        </>
                                    )}
                                </>
                            )}
                        </ul>
                    </div>
                    <div className="user flex items-center justify-center flex-col">
                        <div className="image w-10 h-10 mb-5 bg-bgColor flex items-center justify-center rounded-full">
                            <h4 className='font-bold text-2xl'>{user.name[0]}</h4>
                        </div>
                        <div onClick={LogOut} className='text-bgColor cursor-pointer mb-5 duration-700 hover:text-mainColor hover:bg-bgColor rounded-full p-2'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7">   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /> </svg>                </div></div>
                </section>

                {section === 'dashboard' && (
                    <section className='mSection'>
                        <h2>لوحة البيانات</h2>
                        {/* Content */}
                        <DashboardPage User={user} />

                    </section>
                )}

                {section === 'POS' && (
                    <section className='pos w-full h-full flex flex-col items-center justify-start py-3 px-5 overflow-auto'>
                        {/* Content */}
                        <POSPage User={user} client={client} />

                    </section>
                )}

                {section === 'Expenses' && (
                    <section className='mSection'>
                        <h2>المصروفات</h2>
                        {/* Content */}
                        <ExpensesPage User={user} />

                    </section>
                )}

                {section === 'Items' && (
                    <section className='mSection'>
                        <h2>المنيو و الاصناف</h2>
                        {/* Content */}
                        <ItemsPage />

                    </section>
                )}

                {section === 'Branches' && (
                    <section className='mSection'>
                        <h2>الفـــروع</h2>
                        {/* Content */}
                        <BranchesList />

                    </section>
                )}
                {section === 'WebOrders' && (
                    <section className='mSection'>
                        <h2>طلبات الموقع</h2>
                        {/* Content */}
                        <WebOrdersPage/>

                    </section>
                )}

                {section === 'Users' && (
                    <section className='mSection'>
                        <h2>المستخدمين</h2>
                        {/* Content */}
                        <UsersPage User={user} />

                    </section>
                )}
             
                <ToggleFullScreen />
            </>
        )
    }
}
