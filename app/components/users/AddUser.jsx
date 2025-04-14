'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function AddUser({ Users, Branches }) {
    const [name, setname] = useState('')
    const [username, setusername] = useState('')
    const [password, setpassword] = useState('')
    const [role, setrole] = useState('')
    const [branch, setbranch] = useState('')
    const [alert, setAlert] = useState('')

    const router = useRouter()

    let usernames = []
    Users.map(user => {
        usernames.push(user.username)
    })

    let branchesName = []
    Branches.map(branch => {
        branchesName.push(branch.name)
    })

    const AddUser = async (e) => {
        e.preventDefault()
        setAlert('يتم مراجعة البيانات..')
        if (name && username && password && role && branch) {

            try {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ name, username, password, role, branch })
                })

                if (res.ok) {
                    setAlert('تم إضافة المستخدم بنجاح')
                    setname("")
                    setusername("")
                    setpassword("")
                    setrole("")
                    setbranch("")
                    router.refresh()
                }
            } catch (error) {
                console.log(error);
            }
        } else { 
            setAlert("كل البيانات مطلوبة")
        }


    }

    return (
        <>
            <form onSubmit={AddUser} onClick={() => setAlert('')}>
                <div className="name w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="name">الاسم ثلاثي:</label>
                    <input className='w-full my-2' type="text" name="name" value={name} onChange={(e) => setname(e.target.value)} id="username" placeholder='اسم المستخدم' />
                </div>
                <div className="username w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="username">اسم المستخدم:</label>
                    <input className='w-full my-2' type="text" name="username" value={username} onChange={(e) => setusername(e.target.value)} id="username" placeholder='اسم المستخدم' />
                </div>
                <div className="password w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="password">كلمة المرور:</label>
                    <input className='w-full my-2' type="password" name="password" value={password} onChange={(e) => setpassword(e.target.value)} id="password" placeholder='اسم المستخدم' />
                </div>

                <div className='flex flex-wrap items-center justify-center w-full'>
                    <select className='w-full sm:w-80 mx-0 sm:mx-3 mb-5 lg:mb-5' name="role" id="role" value={role} onChange={(e) => setrole(e.target.value)}>
                        <option value="">وظيفة المستخدم</option>
                        <option value="المالك">المالك</option>
                        <option value="المدير العام">المدير العام</option>
                        <option value="مدير فرع">مدير الفرع</option>
                        <option value="كاشير">كاشير</option>
                    </select>

                    <select className='w-full sm:w-80 mx-0 sm:mx-3 mb-5 lg:mb-5' name="branch" id="branch" value={branch} onChange={(e) => setbranch(e.target.value)}>
                        <option value="">الفرع العامل به</option>
                        {branchesName.map((branch, ind) => (
                            <option key={ind} value={branch}>{branch}</option>
                        ))}
                        <option value="All">الكل</option>
                    </select>


                </div>

                <button className='submitBtn' type='submit'>{alert ? alert : 'إضافة مستخدم'}</button>
            </form>
        </>
    )
}
