'use client'
import React, { useState } from 'react'

export default function AddCategory() {
    const [title, settitle] = useState('')
    const [alert, setAlert] = useState('')

    const AddCategory = async (e) => {
        e.preventDefault()
        setAlert('يتم مراجعة البيانات.. ')
        if (title) {
            try {
                const res = await fetch('/api/categories', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ title })
                })

                if (res.ok) {
                    setAlert("تم إضافة الصنف بنجاح")
                    settitle('')
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setAlert("اكتب اسم الصنف ")
        }
    }

    return (
        <form onSubmit={AddCategory} onChange={() => setAlert('')}>
            <div className="title w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="title">اسم الصنف:</label>
                <input className='w-full my-2' type="text" name="title" value={title} onChange={(e) => settitle(e.target.value)} id="title" placeholder='اسم الصنف' />
            </div>
            <button className='submitBtn' type='submit'>{alert ? alert : 'إضافة الصنف'}</button>
        </form>
    )
}
