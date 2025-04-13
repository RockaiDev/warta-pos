'use client'
import React, { useState } from 'react'

export default function AddItem({ Ctgs, Brns, lasttitle, lastprices, lastcategory, lastdescription, id, editItem }) {
    const [title, settitle] = useState(lasttitle || '')
    const [prices, setprices] = useState(lastprices || [])
    const [category, setcategory] = useState(lastcategory || '')
    const [description, setdescription] = useState(lastdescription || '')
    const [branch, setbranch] = useState("")
    const [price, setPrice] = useState(0)


    let priceSchema = {
        branch: branch,
        price: price,
    }

    const AddPrice = () => {
        if (price && branch) {

            let pricesList = [...prices, priceSchema]
            setprices(pricesList)
            setPrice(0)
            setbranch('')
            console.log(pricesList);
        }
    }

    const DeletePrice = (ind) => {
        let pricesList = [...prices]
        pricesList.splice(ind, 1)
        setprices(pricesList)
    }


    const [alert, setAlert] = useState("")

    const AddItem = async (e) => {
        e.preventDefault()
        if (title && prices.length > 0 && category) {
            try {
                const res = await fetch('/api/items', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ title, prices, category, description })
                })

                if (res.ok) {
                    setAlert('تم إضافة العنصر بنجاح')
                    settitle("")
                    setprices([])
                    setcategory("")
                    setdescription("")
                    setbranch("")
                    setPrice(0)
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            setAlert('اضف كل البيانات')
        }
    }

    // Handle Edit Items
    const [itemId, setItemId] = useState(id || '')
    const [openEdits, setOpenEdits] = useState(editItem)
    const HandleEditItem = async (e) => {
        e.preventDefault()
        if (title && prices.length > 0 && category) {
            try {
                const res = await fetch(`/api/items/${itemId}`, {
                    method: "PUT",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({ title, prices, category, description })
                })

                if (res.ok) {
                    setAlert('تم تعديل العنصر بنجاح')
                }

            } catch (error) {
                console.log(error);
            }
        } else {
            setAlert('اضف كل البيانات')
        }
    }


    return (
        <form onSubmit={openEdits ? HandleEditItem : AddItem} onChange={() => setAlert('')}>
            <div className="title w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="title">اسم العنصر:</label>
                <input className='w-full my-2' type="text" name="title" value={title} onChange={(e) => settitle(e.target.value)} id="title" placeholder='اسم العنصر' />
            </div>
            <div className="title w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="category">اسم الصنف:</label>
                <select className='w-full my-2' name="category" id="category" value={category} onChange={(e) => setcategory(e.target.value)}>
                    <option value="">اختر الصنف</option>
                    {Ctgs.map((ctg, ind) => (
                        <option value={ctg} key={ind}>{ctg}</option>
                    ))}
                </select>
            </div>
            <div className="pricesList w-full mb-3 lg:mb-5">
                {prices.length > 0 && prices.map((price, ind) => (
                    <div onClick={() => DeletePrice(ind)} className="price cursor-pointer flex items-center justify-center p-2 bg-blackColor text-bgColor rounded-full my-1" key={ind}>
                        <h3>{price.branch}</h3>
                        <p className='mx-2'>:</p>
                        <h3>{price.price} ج.م</h3>
                    </div>
                ))}
            </div>
            {prices.length !== Brns.length && (

                <div className='prices w-full mb-3 lg:mb-5 flex flex-wrap items-center justify-center'>
                    <select name="branch" id="branch" value={branch} onChange={(e) => setbranch(e.target.value)}>
                        <option value="">اختر الفرع</option>
                        {Brns.map((brn, ind) => (
                            <option value={brn} key={ind}>{brn}</option>
                        ))}
                    </select>
                    <input type="number" className='w-40 sm:w-auto mx-2 my-2' min={1} name="price" id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder={`${branch} السعر في`} />
                    <div onClick={() => AddPrice()} className="icon p-1 sm:p-1.5 rounded-full cursor-pointer hover:shadow-xl duration-700 bg-mainColor text-bgColor">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">   <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /> </svg>
                    </div>
                </div>
            )}

            <div className="description w-full mb-3 lg:mb-5">
                <textarea name="description" value={description} onChange={(e) => setdescription(e.target.value)} id="desc" className='w-full' placeholder='اكتب وصف العنصر المضاف'></textarea>
            </div>


            <button className='submitBtn' type='submit'>{alert ? alert : editItem ? "تعديل العنصر" : 'إضافة عنصر'}</button>
        </form>
    )
}
