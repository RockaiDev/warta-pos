'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Loading from '../main/Loading'
import AddExpense from './addExpense'
import AddSalary from './AddSalary'
import { useRouter } from 'next/navigation'

export default function ExpensesPage({ User }) {
    const [expenses, setExpenses] = useState(null)
    const [salaries, setSalaries] = useState(null)
    const [users, setusers] = useState(null)
    const [branches, setBranches] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const [openAddExpense, setOpenAddExpense] = useState(false)
    const [openAddSalary, setOpenAddSalary] = useState(false)

    useEffect(() => {
        const getData = async () => {
            try {
                const resExpense = await fetch('/api/expenses', {
                    cache: 'no-store'
                })
                const resSalary = await fetch('/api/salaries', {
                    cache: "no-store"
                })
                const res = await fetch('/api/users', {
                    cache: 'no-store'
                })
                const resbranches = await fetch('/api/branches', {
                    cache: "no-store"
                })

                const users = await res.json()
                setusers(users.users)
                const branches = await resbranches.json()
                setBranches(branches.branches)
                const ResultSalary = await resSalary.json()
                setSalaries(ResultSalary.salaries)
                const ResultExpense = await resExpense.json()
                setExpenses(ResultExpense.expenses)

            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false)
            }
        }
        getData()
    }, [])



    function formatDateTimeToArabic(dateStr) {

        const dateTime = new Date(`${dateStr}`);


        const arabicDateTimeFormatter = new Intl.DateTimeFormat('ar', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });


        return arabicDateTimeFormatter.format(dateTime);
    }





    if (isLoading) {
        return <Loading />
    } else {

        const sortedExpenses = expenses.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
        const sortedSalaries = salaries.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
//بحذف مصروفات معية انا مش محتاجها 
        const Deleteexpenses = async (id) => {
            const confirmed = confirm('هل تريد حذف الصرف ؟')
            if (confirmed) {
                try {
                    const res = await fetch(`/api/expenses?id=${id}`, {
                        method: "DELETE"
                    })

                    if (res.ok) {
                        alert('تم الحذف بنجاح برجاء إعادة تحميل الصفحة للتأكد')
                        router.refresh()
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        const Deletesalaries = async (id) => {
            const confirmed = confirm('هل تريد حذف المرتب ؟')
            if (confirmed) {
                try {
                    const res = await fetch(`/api/salaries?id=${id}`, {
                        method: "DELETE"
                    })

                    if (res.ok) {
                        alert('تم الحذف بنجاح برجاء إعادة تحميل الصفحة للتأكد')
                        router.refresh()
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }

        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="usersListContainer duration-700 lg:w-11/12 h-5/6 p-3 bg-slate-200 rounded-2xl"
                >
                    <div className="head w-full flex items-center justify-between mt-5 mb-10">
                        <div className="addBtns">
                            <button onClick={() => setOpenAddExpense(!openAddExpense)} className='addBtn'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${openAddExpense ? "rotate-45" : ""}`}>   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> إضافة مشتريات</button>
                        </div>
                        <div className="addBtns">
                            <button onClick={() => setOpenAddSalary(!openAddSalary)} className='addBtn'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${openAddSalary ? "rotate-45" : ""}`}>   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> إضافة مرتبات</button>
                        </div>
                    </div>

                    <h2 className='text-xl font-semibold mb-5'>المصروفات و المشتريات:</h2>
                    <div className="expenses w-full bg-bgColor shadow-xl rounded-xl px-1 overflow-hidden mb-10">
                        <table className='w-full text-sm'>
                            <thead>
                                <tr>
                                    <th>تاريخ الصرف</th>
                                    <th>السبب</th>
                                    <th>المبلغ</th>
                                    <th>المستخدم</th>
                                    <th>الفرع</th>
                                    {User.role === 'المالك' && (<th></th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedExpenses.map((expense, ind) => (
                                    <tr key={ind} className='hover:bg-gray-200'>
                                        <td title={`${formatDateTimeToArabic(expense.createdAt)}`}>{new Date(expense.createdAt).toLocaleDateString()}</td>
                                        <td>{expense.reason}</td>
                                        <td>{expense.value} L.E</td>
                                        <td>{expense.user}</td>
                                        <td>{expense.branch}</td>
                                        {User.role === "المالك" && (<td><svg onClick={() => Deleteexpenses(expense._id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer p-1 bg-blackColor text-red-500 rounded-lg">   <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg></td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h2 className='text-xl font-semibold mb-5'>المــرتـبـات:</h2>
                    <div className="expenses w-full bg-bgColor shadow-xl rounded-xl px-1 overflow-hidden mb-10">
                        <table className='w-full  text-sm'>
                            <thead>
                                <tr>
                                    <th>تاريخ الصرف</th>
                                    <th>الموظف</th>
                                    <th>المبلغ</th>
                                    <th>المستخدم</th>
                                    <th>الفرع</th>
                                    {User.role === 'المالك' && (<th></th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {sortedSalaries.map((salary, ind) => (
                                    <tr key={ind} className='hover:bg-gray-200'>
                                        <td title={`${formatDateTimeToArabic(salary.createdAt)}`}>{new Date(salary.createdAt).toLocaleDateString()}</td>
                                        <td>{salary.payFor}</td>
                                        <td>{salary.salary} L.E</td>
                                        <td>{salary.user}</td>
                                        <td>{salary.branch}</td>
                                        {User.role === "المالك" && (<td><svg onClick={() => Deletesalaries(salary._id)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 cursor-pointer p-1 bg-blackColor text-red-500 rounded-lg">   <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg></td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </motion.div>

                {/* Add Expense */}
                <div className={`addItems flex items-center justify-center p-2 absolute top-0 right-0 bg-bgColor duration-700 ${openAddExpense ? "w-full opacity-100 h-full rounded-none" : "rounded-2xl opacity-0 w-0 h-0"}`}>
                    {openAddExpense && (
                        <>
                            <button onClick={() => setOpenAddExpense(!openAddExpense)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                            <AddExpense branches={branches} User={User} />
                        </>
                    )}
                </div>

                {/* Add Salary */}
                <div className={`addItems flex items-center justify-center p-2 absolute top-0 left-0 bg-bgColor duration-700 ${openAddSalary ? "w-full opacity-100 h-full rounded-none" : "rounded-2xl opacity-0 w-0 h-0"}`}>
                    {openAddSalary && (
                        <>
                            <button onClick={() => setOpenAddSalary(!openAddSalary)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                            <AddSalary branches={branches} User={User} users={users} />
                        </>
                    )}
                </div>
            </>
        )
    }
}
