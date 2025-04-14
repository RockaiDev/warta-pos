'use client'
import React, { useState } from 'react'

export default function AddExpense({ branches, User }) {
    const [title, settitle] = useState("")
    const [value, setvalue] = useState(0)
    const [branch, setbranch] = useState("")
    const [description, setdescription] = useState("")
    const [alert, setAlert] = useState("")

    const reason = `${title} (${description})`
    const user = User.name

    const AddExpense = async (e) => {
        e.preventDefault()
        setAlert('يتم مراجعة البيانات..')
        if (title && value) {
            try {
                const res = await fetch('/api/expenses', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ reason, value, description, user, branch })
                })

                if (res.ok) {
                    setAlert("تم إضافة الصرف")
                    settitle('')
                    setvalue('')
                    setbranch('')
                    setdescription('')
                }

            } catch (error) {
                console.log(error)
            }
        } else {
            setAlert('جميع البيانات مطلوبة')
        }
    }

    let branchesName = []
    branches.map(branch => {
        branchesName.push(branch.name)
    })

    return (
        <>
            <form onSubmit={AddExpense}>
                <div className="title w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="title">أذكر سبب الصرف:</label>
                    <select className='w-full my-2' name="title" id="title" value={title} onChange={(e) => settitle(e.target.value)}>
                        <option value="">سبب الصرف</option>
                        <option value="بضائع">بضائع</option>
                        <option value="توصيل">توصيل</option>
                        <option value="اخرى">اخرى</option>
                    </select>
                </div>
                <div className="value w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="value">قيمة الصرف:</label>
                    <input className='w-full my-2' type="number" name="value" value={value} onChange={(e) => setvalue(e.target.value)} id="title" placeholder='القيمة' />
                </div>
                <div className="description w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="branch">الفرع :</label>
                    <select className='my-2 w-full' name="branch" id="branch" value={branch} onChange={(e) => setbranch(e.target.value)}>
                        <option value="">اختر الفرع</option>
                        {branchesName.map((branch, ind) => (
                            <option key={ind} value={branch}>{branch}</option>
                        ))}
                        <option value="All">الكل</option>
                    </select>
                </div>
                <div className="description w-full mb-3 lg:mb-5">
                    <label className='text-xl font-semibold' htmlFor="description">تفاصيل اخرى :</label>
                    <textarea className='my-2 w-full' name="description" id="description" value={description} onChange={(e) => setdescription(e.target.value)} placeholder='تفاصيل اخرى'></textarea>
                </div>

                <button className='submitBtn w-full'>{alert ? alert : "إضافة الصرف"}</button>
            </form>
        </>
    )
}
