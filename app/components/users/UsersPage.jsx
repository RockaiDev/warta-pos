'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import AddUser from './AddUser'
import Loading from '../main/Loading'
import Image from 'next/image'

export default function UsersPage({User}) {
    const [users, setusers] = useState(null)
    const [branches, setBranches] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [openAddUser, setOpenAddUser] = useState(false)

    const router = useRouter()

    
    
    
    useEffect(() => {
        
        const getUsers = async () => {
            try {
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
    
            } catch (error) {
                console.log(error);
            } finally {
                setIsLoading(false)
            }
        }

        getUsers()

    }, [])

    if (isLoading) {
        return <Loading />
    } else {

        const deleteUser = async (username) => {
            console.log(username);
            try {
                const res = await fetch(`/api/users/${username}`, {
                    method: "DELETE"
                })

                if (res.ok) {
                    router.refresh()
                }
            } catch (error) {
                console.log();
            }
        }

        const secPassword = (text) => {
            if (User.role === 'المالك') {
                return text
            } else {
                return "*".repeat(text?.length)
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
                    <div className="head flex items-center justify-between flex-wrap my-10">
                        <div className="addBtns flex items-center justify-center">
                            <button onClick={() => setOpenAddUser(!openAddUser)} className='addBtn'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${openAddUser ? "rotate-45" : ""} size-6`}>   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> إضافة مستخدم</button>
                        </div>
                    </div>
                    {openAddUser ? (
                        <>
                            <AddUser Users={users} Branches={branches} />
                        </>
                    ) : (
                        <div className="usersList w-full flex flex-wrap items-center justify-center">
                            {users.map((user, ind) => (
                                <div className="user m-4 flex flex-col items-center justify-center p-2 border-2 border-black rounded-xl w-80 cursor-pointer hover:shadow-xl duration-700" key={ind}>
                                    <Image src={"/man.png"} width={50} height={50} alt='Person' />
                                    <h2 className='my-1'>{user.name}</h2>
                                    <h4>{user.username}</h4>
                                    <h4>{secPassword(user.password)}</h4>
                                </div>
                            ))}
                        </div>
                    )
                    }
                </motion.div>
            </>
        )
    }
}
