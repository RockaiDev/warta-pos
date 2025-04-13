'use client'
import React, { useState } from 'react'

export default function AddBranch() {
    const [name, setname] = useState('')
    const [location, setlocation] = useState('')
    const [phone, setphone] = useState('')

    const [alert, setAlert] = useState('')

    const AddBranch = async (e) => {
        e.preventDefault()
        setAlert('يتم مراجعة البيانات')
        if (name && location && phone) {
            try {
                const res = await fetch('/api/branches', {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ name, location, phone })
                })

                if (res.ok) {
                    setAlert('تم إضافة الفرع بنجاح')
                    setname('')
                    setlocation('')
                    setphone('')
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setAlert('يجب إضافة كل البيانات')
        }

    }

    return (
        <form onSubmit={AddBranch} onChange={() => setAlert('إضافة الفرع')}>
            <div className="name w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="name">اسم الفرع:</label>
                <input className='w-full my-2' type="text" name="name" value={name} onChange={(e) => setname(e.target.value)} id="username" placeholder='اسم الفرع' />
            </div>
            <div className="location w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="location">العنوان:</label>
                <input className='w-full my-2' type="location" name="location" value={location} onChange={(e) => setlocation(e.target.value)} id="location" placeholder='العنوان' />
            </div>
            <div className="phone w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="phone">رقم الهاتف:</label>
                <input className='w-full my-2' type="tel" name="phone" value={phone} onChange={(e) => setphone(e.target.value)} id="location" placeholder='رقم الهاتف' />
            </div>
            <button className='submitBtn' type='submit'>{alert ? alert : 'إضافة الفرع'}</button>
        </form>
    )
}
