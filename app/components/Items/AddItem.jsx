'use client'
import React, { useState } from 'react'

export default function AddItem({ Ctgs, Brns, lasttitle, lastprices, lastcategory, lastdescription, id, editItem, refreshItems }) {
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

    // Handle Delete Item
    const HandleDeleteItem = async () => {
        if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
            try {
                const res = await fetch(`/api/items/${itemId}`, {
                    method: "DELETE",
                    headers: {
                        "Content-type": "application/json"
                    }
                })

                if (res.ok) {
                    setAlert('تم حذف العنصر بنجاح')
                    // Reset form after successful deletion
                    setTimeout(() => {
                        settitle("")
                        setprices([])
                        setcategory("")
                        setdescription("")
                        setbranch("")
                        setPrice(0)
                        setItemId('')
                        setOpenEdits(false)
                        // You might want to refresh the parent component here
                        refreshItems()
                    }, 1000)
                }

            } catch (error) {
                console.log(error);
                setAlert('حدث خطأ أثناء حذف العنصر')
            }
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

            <div className="buttons flex gap-3">
                <button className='submitBtn flex-1' type='submit'>{alert ? alert : editItem ? "تعديل العنصر" : 'إضافة عنصر'}</button>
                {editItem && (
                    <button 
                        type="button" 
                        onClick={HandleDeleteItem}
                        className='deleteBtn bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold duration-300 flex items-center gap-2'
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        حذف
                    </button>
                )}
            </div>
        </form>
    )
}
