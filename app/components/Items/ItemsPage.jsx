'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import AddItem from './AddItem'
import AddCategory from './AddCategory'
import Loading from '../main/Loading'
import Image from 'next/image'

export default function ItemsPage() {
    const [filter, setfilter] = useState('')
    const [category, setCategory] = useState('')
    const [openAddCategory, setOpenAddCategory] = useState(false)
    const [openAddItem, setOpenAddItem] = useState(false)

    const [categories, setCategories] = useState(null)
    const [items, setitems] = useState(null)
    const [branches, setBranches] = useState(null)

    const [isLoading, setIsLoading] = useState(true)


    // EditItem
    const [itemId, setItemId] = useState('')
    const [lasttitle, setlasttitle] = useState('')
    const [lastprices, setlastprices] = useState([])
    const [lastcategory, setlastcategory] = useState('')
    const [lastdescription, setlastdescription] = useState('')
    const [editItemPermetion, setEditItemPermetion] = useState(false)

    // Refresh items function
    const refreshItems = async () => {
        try {
            const ResultItems = await fetch('/api/items', {
                cache: 'no-store'
            })
            const items = await ResultItems.json()
            setitems(items.items)
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        const getData = async () => {
            try {
                const ResultCtg = await fetch('/api/categories', {
                    cache: "no-store"
                })
                const ResultItems = await fetch('/api/items', {
                    cache: 'no-store'
                })
                const res = await fetch('/api/branches', {
                    cache: "no-store"
                })

                const result = await res.json()
                setBranches(result.branches)

                const Ctg = await ResultCtg.json()
                setCategories(Ctg.categories)

                const items = await ResultItems.json()
                setitems(items.items)


            } catch (error) {
                console.log();
            } finally {
                setIsLoading(false)
            }
        }

        getData()
    }, [])



    if (isLoading) {
        return <Loading />
    } else {
        const clist = []
        categories.map(ctg => {
            clist.push(ctg.title)
        })

        let branchesName = []
        branches.map(branch => {
            branchesName.push(branch.name)
        })

        const FilterdItems = items.filter(item => {
            const matchedName = item.title.includes(filter)
            const matchedCategory = !category || item.category === category
            return matchedCategory && matchedName
        })

        return (
            <>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="itemsListContainer duration-700 lg:w-11/12 p-3 bg-slate-200 rounded-2xl"
                >
                    <div className="head flex items-center justify-between flex-wrap my-10">
                        <div className="searchbar flex items-center justify-center w-full lg:w-auto mb-2">
                            {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg> */}
                            <input type="text" name="filter" id="filter" value={filter} onChange={(e) => setfilter(e.target.value)} placeholder='ابحث عن عنصر في المنيو' />
                        </div>
                        <div className="addBtns flex items-center justify-center w-full lg:w-auto">
                            <button onClick={() => setOpenAddCategory(!openAddCategory)} className='addBtn'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${openAddCategory ? "rotate-45" : ""}`}>   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> إضافة صنف</button>
                            <button onClick={() => setOpenAddItem(!openAddItem)} className='addBtn'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${openAddItem ? "rotate-45" : ""}`}>   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg> إضافة عنصر</button>
                        </div>
                    </div>
                    <div className="categoriesList flex flex-wrap justify-center items-center">
                        <ul className='flex w-full flex-center justify-center lg:justify-start flex-wrap'>
                            <li className={`cbtn ${category === "" ? "text-bgColor bg-black" : ' bg-bgColor text-blackColor'}`} onClick={() => setCategory('')}>الكل</li>
                            {clist.map((c, ind) => (
                                <li key={ind} className={`cbtn ${category === c ? "text-bgColor bg-black" : ' bg-bgColor text-blackColor'}`} onClick={() => setCategory(c)}>{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="itemsList my-10 flex items-center justify-center flex-wrap">
                        {FilterdItems.map((item, ind) => (
                            <div
                                onClick={() => {
                                    setOpenAddItem(true)
                                    setEditItemPermetion(true)
                                    setItemId(item._id)
                                    setlasttitle(item.title)
                                    setlastprices(item.prices)
                                    setlastcategory(item.category)
                                    setlastdescription(item.description)
                                }}
                                className="item flex flex-col items-center justify-center p-2 m-3 border-2 border-black rounded-xl w-40 hover:shadow-xl duration-700 cursor-pointer" key={ind}
                            >
                                <Image src={item.category === 'برجر' ? "/burger.png": item.category === 'فرايز' ? "/fries.png" : item.category === "وجبات" ? "/meal.png" : "/offer.png"} width={50} height={50} alt='Item Icon' />
                                <h2 className='text-center text-xs my-1'>{item.title}</h2>
                            </div>
                        ))}
                    </div>
                </motion.div>


                {/* Add Components */}
                <div className={`addItems flex items-center justify-center p-2 absolute top-0 left-0 bg-bgColor duration-700 ${openAddItem ? "w-full opacity-100 h-full rounded-none" : "rounded-2xl opacity-0 w-0 h-0"}`}>
                    {openAddItem && (
                        <>
                            <button onClick={() => {
                                setOpenAddItem(!openAddItem)
                                setEditItemPermetion(false)
                                setItemId('')
                                setlasttitle("")
                                setlastprices([])
                                setlastcategory("")
                                setlastdescription("")
                            }} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                            <AddItem Ctgs={clist} Brns={branchesName} lasttitle={lasttitle} lastprices={lastprices} lastdescription={lastdescription} lastcategory={lastcategory} id={itemId} editItem={editItemPermetion} refreshItems={refreshItems} />
                        </>
                    )}
                </div>

                <div className={`addItems flex items-center justify-center p-2 absolute top-0 left-0 bg-bgColor duration-700 ${openAddCategory ? "w-full opacity-100 h-full rounded-none" : "rounded-2xl opacity-0 w-0 h-0"}`}>
                    {openAddCategory && (
                        <>
                            <button onClick={() => setOpenAddCategory(!openAddCategory)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                            <AddCategory />
                        </>
                    )}
                </div>

                {/* Edit Component */}
            </>
        )
    }
}
