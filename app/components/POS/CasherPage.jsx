'use client'
import Image from 'next/image'
import React, { useState } from 'react'

export default function CasherPage({ shift, items, User, clients }) {
    const [category, setCategory] = useState('')
    const [invoices, setInvoices] = useState(shift.invoices)
    const [showInvoices, setShowInvoices] = useState(false)
    const [expenses, setExpenses] = useState(shift.expenses)
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [alert, setAlert] = useState('')

    const FilterdItems = items.filter(item => {
        const matchedCategory = !category || item.category === category
        return matchedCategory
    })

    const clist = [...new Set(items.map(item => item.category))];

    const priceInTheBranch = (prices) => {
        let branchPrice = prices.find(price => price.branch === shift.branch)
        return +branchPrice?.price
    }

    const totalIncome = () => {
        let totalShiftIncome = 0
        invoices.map((invoice) => {
            totalShiftIncome = totalShiftIncome + invoice.total
        })
        return totalShiftIncome
    }

    const totalDiscounts = () => {
        let totalDiscount = 0
        invoices.map(invoice => {
            totalDiscount = totalDiscount + +invoice.discount
        })
        return totalDiscount
    }

    const totalPayment = (method) => {
        let totalPay = 0

        const filterdInvoices = shift.invoices.filter(invoice => {
            const paymentMethod = invoice.payment === method
            return paymentMethod
        })

        filterdInvoices.map(invoice => {
            totalPay = totalPay + +invoice.total
        })

        return totalPay
    }

    const totalExpenses = () => {
        let totalShiftExpense = 0
        expenses.map(expense => {
            totalShiftExpense = totalShiftExpense + +expense.value
        })
        return totalShiftExpense
    }

    const totalRefund = () => {
        return totalIncome() - totalExpenses()
    }

















    // Handle Expenses **********************
    const [reason, setreason] = useState('')
    const [value, setvalue] = useState(0)
    const [description, setdescription] = useState('')

    const expense = {
        reason: reason,
        value: value,
        description: description,
        user: User.name,
        branch: shift.branch,
    }


    const AddExpense = (e) => {
        e.preventDefault()

        if (value > 0) {
            const expensesHandle = [...expenses, expense]
            setExpenses(expensesHandle)
            setAlert('الرجاء تأكيد الصرف')
        } else {
            setAlert('كل البيانات مطلوبة')
        }
    }

    const sendExpense = async () => {
        setAlert('يتم مراجعة البيانات..')
        try {
            const resExpense = await fetch('/api/expenses', {
                method: "POST",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(expense)
            })

            const resShift = await fetch(`/api/shifts/${shift._id}`, {
                method: "PUT",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ expenses })
            })

            if (resShift.ok && resExpense.ok) {
                setAlert('')
                setreason('')
                setvalue(0)
                setdescription('')
                setShowAddExpense(false)
            }

        } catch (error) {
            console.log(error)
        }
    }

    // Handle Expenses **********************






















    // Handle Invoice ************************
    const [itemsInOrder, setItemsInOrder] = useState([])
    const [quantity, setQuantity] = useState(1)
    const [isSpicy, setIsSpicy] = useState(false)
    const [without, setwithout] = useState("")
    const [client, setClient] = useState('Take Away')
    const [discount, setDiscount] = useState(0)
    const [taxs, setTaxs] = useState(0)
    const [payment, setPayment] = useState('Cash')
    const [delivery, setDelivery] = useState(0)
    const [invoiceId, setInvoiceId] = useState()

    const AddItemToOrder = (title, price, quantity, category, isSpicy, without) => {
        const item = {
            title: title,
            price: price,
            category: category,
            quantity: quantity,
            isSpicy: isSpicy,
            without: without
        }
        let itemsHandle = [...itemsInOrder, item]
        setItemsInOrder(itemsHandle)
    }

    const removeItemFromOrder = (ind) => {
        let itemsHandle = [...itemsInOrder]
        itemsHandle.splice(ind, 1)
        setItemsInOrder(itemsHandle)
    }

    // Payment Data
    const [showInvoice, setShowInvoice] = useState(false)
    const subTotalItems = (items) => {
        let totalItemsPrice = 0
        items.map(item => {
            totalItemsPrice = totalItemsPrice + (item.price * item.quantity)
        })
        return totalItemsPrice
    }

    const mainTotalItemsPrice = () => {
        let totalItemsPrice = subTotalItems(itemsInOrder)
        let mainTotal = (totalItemsPrice + delivery + taxs) - (discount)
        return mainTotal
    }

    const invoice = {
        client: client,
        items: [...itemsInOrder],
        total: mainTotalItemsPrice(),
        discount: discount,
        taxs: taxs,
        delivery: delivery,
        user: User.name,
        payment: payment,
        branch: shift.branch,
        id: invoices.length + 1

    }

    const AddInvoice = () => {
        if (itemsInOrder.length > 0) {
            let invoicesHandle = [...invoices, invoice]
            setInvoiceId(invoice.id)
            setInvoices(invoicesHandle)
            setAlert('تم إنشاء الفاتورة')
            setShowInvoice(true)
            if (client === 'delivery') {
                AddOrderToClient()
            }
        } else {
            setAlert('لا يوجد شيء في الفاتورة')
        }
    }

    const sendOrderAndPrint = async () => {

        try {
            const resInvoice = await fetch('/api/invoices', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(invoice)
            })

            const resShift = await fetch(`/api/shifts/${shift._id}`, {
                method: "PUT",
                headers: {
                    "Content-type": 'application/json'
                },
                body: JSON.stringify({ invoices })
            })

            
            if (resInvoice.ok && resShift.ok) {
                setAlert('تم إنشاء الطلب بنجاح')
                setItemsInOrder([])
                setDiscount(0)
                setDelivery(0)
                setTaxs(0)
                window.print()
                if (client === 'delivery') {
                    const resClient = await fetch(`/api/clients/${JSON.parse(clientSelected)._id}`, {
                        method: "PUT",
                        headers: {
                            "Content-type": 'application/json'
                        },
                        body: JSON.stringify({ orders: clientOrders })
                    })

                    if (resClient.ok) {
                        setAlert('تم إضافة الطلب للعميل')
                        setClientSelected(null)
                        setClientOrders([])
                        setShowAddClient(false)
                        setShowEditClient(false)
                        setClientName('')
                        setClientPhone('')
                        setClientAddress('')
                        setClientDelivery(0)
                        setClientPoints(0)
                    }
    
                }
            }

        } catch (error) {
            console.log(error);
        }
    }


    const updateShift = async () => {
        try {
            const resShift = await fetch(`/api/shifts/${shift._id}`, {
                method: "PUT",
                headers: {
                    "Content-type": 'application/json'
                },
                body: JSON.stringify({ invoices })
            })

            if (resShift.ok) {
                setAlert('تم تحديث الشيفت بنجاح')
                setItemsInOrder([])
                setDiscount(0)
                setTaxs(0)
                setDelivery(0)
                setShowInvoice(false)
            }


        } catch (error) {
            console.log(error);
        }
    }


    // Handle Invoice ************************















    // Close Shift ****************************
    const [showReport, setShowReport] = useState(false)

    let status = 'close'
    let close = User.name
    const CloseShift = async () => {
        const confirmed = confirm('هل تريد اغلاق الوردية؟')
        if (confirmed) {
            try {
                const res = await fetch(`/api/shifts/${shift._id}`, {
                    method: "PUT",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ status, close })
                })

                if (res.ok) {
                    window.print()
                    location.reload()
                }

            } catch (error) {
                console.log(error);
            }
        }
    }


    // Close Shift ****************************










    // Delete Shift *************************
    const DeleteShift = async (id) => {
        const confirmed = confirm('هل تريد إلغاء الوردية؟\nلن تتمكن من استعادة البيانات مجدداً')
        if (confirmed) {

            try {
                const res = await fetch(`/api/shifts/${id}`, {
                    method: 'DELETE'
                })

                if (res.ok) {
                    location.reload()
                }

            } catch (error) {
                console.log(error);
            }
        }
    }
    // Delete Shift *************************

    // Delete Invoice ***********************
    const [indexToDelete, setIndexToDelete] = useState(null)
    const DeleteInvoiceFromShift = (id) => {
        const handleInvoices = [...invoices]
        handleInvoices.splice(id, 1)
        setInvoices(handleInvoices)
        setIndexToDelete(null)
    }
    // Delete Invoice ***********************




    // Add Client **************************
    const [showAddClient, setShowAddClient] = useState(false)
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientAddress, setClientAddress] = useState('')
    const [clientDelivery, setClientDelivery] = useState(0)
    const [clientPoints, setClientPoints] = useState(0)

    const handleAddClient = async (e) => {
        e.preventDefault()
        setAlert('جاري إضافة العميل..')
        const clientExist = clients.find(client => client.phone === clientPhone)
        if (clientExist) {
            setAlert(`العميل موجود بالفعل باسم ${clientExist.name}`)
            return
        }
        try {
            const res = await fetch('/api/clients', {
                method: "POST",
                headers: {

                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ name: clientName, phone: clientPhone, address: clientAddress, delivery: clientDelivery, points: clientPoints })
            })

            if (res.ok) {
                setAlert('تم إضافة العميل بنجاح')
                setClientName('')
                setClientPhone('')
                setClientAddress('')
                setClientDelivery(0)
                setClientPoints(0)
            }

        } catch (error) {
            console.log(error);
        }
    }
    // Add Client **************************

    // Edit Client **************************
    const [showEditClient, setShowEditClient] = useState(false)
    const [clientId, setClientId] = useState('')

    const handleEditClient = async (e) => {
        e.preventDefault()
        setAlert('جاري تعديل العميل..')
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ name: clientName, phone: clientPhone, address: clientAddress, delivery: clientDelivery, points: clientPoints })
            })

            if (res.ok) {
                setAlert('تم تعديل العميل بنجاح')
            }

        } catch (error) {
            console.log(error);
        }
    }
    // Edit Client **************************

    // Add Order To Client ******************
    const [clientOrders, setClientOrders] = useState([])

    const AddOrderToClient = () => {
        const clientOrdersHandle = [...JSON.parse(clientSelected).orders, { items: itemsInOrder, total: mainTotalItemsPrice(), discount: discount, taxs: taxs, delivery: delivery, payment: payment, branch: shift.branch }]
        setClientOrders(clientOrdersHandle)
        setAlert('تم إضافة الطلب للعميل')
    }

    // Filter Clients ***********************
    const [searchClient, setSearchClient] = useState('')
    const [clientSelected, setClientSelected] = useState(null)
    const FilteredClients = clients.filter(client => {
        const matchedClient = client.name.toLowerCase().includes(searchClient.toLowerCase())
        const matchedPhone = client.phone.includes(searchClient)
        return matchedClient || matchedPhone
    })







    const FormatedDate = (date) => {
        const CreateDate = new Date(date)
        // Format the date
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = CreateDate.toLocaleString('ar-EG', options);
        return formattedDate
    }

    return (
        <>
            <div className="data w-full flex items-center justify-center flex-wrap">
                <h2 className='text-mainColor text-xs m-2'>التاريخ: {FormatedDate(new Date())}</h2>
                <h2 className='text-mainColor text-xs m-2'>الكاشير:{User.name}</h2>
                <h2 className='text-mainColor text-xs m-2'>قام بفتح الوردية: {shift.casher}</h2>
                {User.role === "المالك" && <div onClick={() => DeleteShift(shift._id)} className="btn text-xs p-1 bg-red-500 text-bgColor font-bold rounded-lg cursor-pointer">حذف الوردية</div>}
            </div>
            <div className="options w-10/12 bg-mainColor p-1 mt-5 rounded-full flex items-center justify-center">
                <ul className='flex items-center justify-center w-full'>
                    <li onClick={() => setShowAddExpense(!showAddExpense)} className='p-2 text-bgColor cursor-pointer mx-2 hover:text-mainColor hover:bg-bgColor rounded-full'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></li>
                    <li onClick={() => setShowReport(!showReport)} className='p-2 text-bgColor cursor-pointer mx-2 hover:text-mainColor hover:bg-bgColor rounded-full'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /> </svg></li>
                </ul>
            </div>
            <h2 className='font-bold text-2xl text-start w-full mt-5'>تفاصيل الوردية:</h2>
            <div className="Info flex items-center justify-center sm:justify-start flex-wrap my-5 w-full">
                <div onClick={() => setShowInvoices(!showInvoices)} className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-gray-100">
                    <h2 className='text-2xl font-bold'>الطلبات</h2>
                    <h3 className='text-xl text-yellow-800 font-bold'>{invoices.length} طلب</h3>
                    <div className="color w-full p-2 bg-yellow-500 rounded-full">
                    </div>
                </div>
                <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-gray-100">
                    <h2 className='text-2xl font-bold'>المصاريف</h2>
                    <h3 className='text-xl text-red-500 font-bold'>{totalExpenses()} ج.م</h3>
                    <div className="color w-full p-2 bg-red-500 rounded-full">
                    </div>
                </div>
                <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-gray-100">
                    <h2 className='text-2xl font-bold'>مجموع الدخل</h2>
                    <h3 className='text-xl text-blue-500 font-bold'>{totalIncome()} ج.م</h3>
                    <div className="color w-full p-2 bg-blue-500 rounded-full">
                    </div>
                </div>
                <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-gray-100">
                    <h2 className='text-2xl font-bold'>يوجد في الخزنة</h2>
                    <h3 className='text-xl text-green-500 font-bold'>{totalRefund()} ج.م</h3>
                    <div className="color w-full p-2 bg-green-500 rounded-full">
                    </div>
                </div>
            </div>
            <div className="orders w-full">
                {showInvoices && (
                    <div className="invoices w-full flex items-start justify-center flex-col">
                        <h2 className='text-xl mb-4 font-bold'>الفواتير:</h2>
                        {invoices.map((invoice, ind) => (
                            <div onClick={() => {
                                setShowInvoice(!showInvoice)
                                setItemsInOrder(invoice.items)
                                setPayment(invoice.payment)
                                setDelivery(invoice.delivery)
                                setTaxs(invoice.taxs)
                                setClient(invoice.client)
                                setDiscount(invoice.discount)
                                setInvoiceId(invoice.id)
                                setIndexToDelete(ind)
                            }} className="invoice cursor-pointer hover:bg-slate-50 hover:border-mainColor border-2 bg-gray-300 w-full p-2 flex items-center justify-between rounded-xl my-1" key={ind}>
                                <h4 className='font-bold items-center text-xl'>{ind + 1} -</h4>
                                <h4><span className='font-bold items-center'>الإجمالي: </span>{invoice.total} ج.م</h4>
                                <h4><span className='font-bold hidden md:flex items-center'>الاصناف: </span>{invoice.items.length} أصناف</h4>
                                <h4><span className='font-bold items-center'>طريقة الدفع: </span>{invoice.payment}</h4>
                                <h4><span className='font-bold items-center'>العميل: </span>{invoice.client}</h4>
                                <h4 onClick={() => setShowInvoice(!showInvoice)} className='text-green-500 p-1 bg-mainColor rounded-xl cursor-pointer font-bold text-xl'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /> </svg></h4>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className='w-full flex items-start justify-center flex-col lg:flex-row lg:justify-start my-5'>
                <div className={`itemsList w-full lg:w-8/12 lg:ml-5 border-mainColor rounded-xl p-2 border my-2 lg:my-0`}>
                    <div className="categoriesList flex flex-wrap justify-center items-center">
                        <ul className='flex w-full flex-center justify-center lg:justify-start flex-wrap'>
                            <li className={`cbtn ${category === "" ? "text-bgColor bg-black" : ' bg-bgColor text-blackColor'}`} onClick={() => setCategory('')}>الكل</li>
                            {clist.map((c, ind) => (
                                <li key={ind} className={`cbtn ${category === c ? "text-bgColor bg-black" : ' bg-bgColor text-blackColor'}`} onClick={() => setCategory(c)}>{c}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="quantity flex items-center justify-end p-2">
                        <div onClick={() => setQuantity(quantity + 1)} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg></div>
                        <h3 className='text-2xl mx-2'>{quantity}</h3>
                        <div onClick={() => {
                            if (quantity >= 2) {
                                setQuantity(quantity - 1)
                            }
                        }} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                        </div>
                    </div>
                    <div className="spicy w-full flex items-center justify-end p-2">
                        <div className="without">
                            <select name="without" id="with" value={without} onChange={(e) => setwithout(e.target.value)} className='w-60 p-1 ml-2 border-2 border-blackColor rounded-xl'>
                                <option value="">بدون</option>
                                <option value="بدون خضرة">بدون خضرة</option>
                                <option value="بدون صوص">بدون صوص</option>
                                <option value="بدون بصل">بدون بصل</option>
                                <option value="بدون خيار مخلل">بدون خيار مخلل</option>
                                <option value="سادة">سادة</option>
                            </select>
                        </div>
                        <div onClick={() => setIsSpicy(!isSpicy)} className={`cursor-pointer w-[200px] p-1 rounded-xl flex items-center justify-center border-2 ${isSpicy ? "bg-black text-white" : "bg-white text-black"} border-blackColor hover:bg-blackColor hover:text-bgColor`}>Spicy</div>
                    </div>
                    <div className='without w-full flex items-center justify-end p-2'>
                        <label htmlFor="without">تعليق: </label>
                        <input type="text" value={without} onChange={(e) => setwithout(e.target.value)} placeholder='تعليق' className='w-80 p-1 mr-2 border-2 border-blackColor rounded-xl' id='without' />
                    </div>
                    <div className="itemsList my-10 flex items-center justify-center lg:justify-start flex-wrap w-full">
                        {FilterdItems.map((item, ind) => (
                            <div onClick={() => {
                                AddItemToOrder(item.title, priceInTheBranch(item.prices), quantity, item.category, isSpicy, without)
                                setQuantity(1)
                                setIsSpicy(false)
                                setwithout('')
                            }} className="item flex flex-col items-center justify-center p-2 m-1 lg:m-3 border-2 border-black rounded-xl w-40 hover:shadow-xl duration-700 cursor-pointer" key={ind}>
                                <Image src={item.category === 'برجر' ? "/burger.png" : item.category === 'فرايز' ? "/fries.png" : item.category === "وجبات" ? "/meal.png" : "/offer.png"} width={50} height={50} alt='Item Icon' />
                                <h2 className='text-center text-xs my-1'>{item.title}</h2>
                                <h2 className='font-bold'>{priceInTheBranch(item.prices)} ج.م</h2>

                            </div>
                        ))}
                    </div>
                </div>

                {/* تفاصيل الدفع */}
                <div className="CheckoutCash w-full lg:w-auto lg:min-w-96 border-mainColor rounded-xl p-3 border">
                    <h2>تفاصيل الطلب:</h2>
                    <div className="client flex items-center justify-between w-full my-3">
                        <h3>العميل: </h3>
                        <select className='w-60' name="client" id="client" value={client} onChange={(e) => setClient(e.target.value)}>
                            <option value="Take Away">Take Away</option>
                            <option value="Talabat">Talabat</option>
                            <option value="El-menus">El-menus</option>
                            <option value="delivery">delivery</option>
                        </select>
                    </div>

                    {client === 'delivery' && (
                        <>
                            <div className="searchClient w-full flex items-center justify-between my-3">
                                <input type="text" value={searchClient} onChange={(e) => setSearchClient(e.target.value)} placeholder='بحث عن العميل' className='w-60 p-1 border-2 border-blackColor rounded-xl' />
                                <div onClick={() => {
                                    if (clientSelected) {
                                        setShowAddClient(!showAddClient)
                                        setShowEditClient(!showAddClient)
                                        setClientName(JSON.parse(clientSelected).name)
                                        setClientPhone(JSON.parse(clientSelected).phone)
                                        setClientAddress(JSON.parse(clientSelected).address)
                                        setClientDelivery(JSON.parse(clientSelected).delivery)
                                        setClientPoints(JSON.parse(clientSelected).points)
                                        setClientOrders(JSON.parse(clientSelected).orders)
                                        setClientId(JSON.parse(clientSelected)._id)
                                    } else {
                                        setShowAddClient(!showAddClient)
                                    }
                                }} className="btn p-1 bg-mainColor text-bgColor font-bold rounded-lg cursor-pointer">{clientSelected ? "تعديل" : "إضافة"} عميل</div>
                            </div>
                            <div className="clients w-full flex items-center justify-center">
                                <select className='w-full' name="client" id="client" value={clientSelected} onChange={(e) => setClientSelected(e.target.value)}>
                                    <option value={'null'}>اختر العميل</option>
                                    {FilteredClients.map((client, ind) => (
                                        <option key={ind} value={JSON.stringify(client)}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                            {clientSelected && (
                                <>
                                    <div className="detailsAboutClient w-full flex flex-col items-center justify-center my-3">
                                        <div className="orders w-full flex items-center justify-between">
                                            <h3>مجموع الطلبات</h3>
                                            <h3>{clientSelected && JSON.parse(clientSelected)?.orders?.length} طلب</h3>
                                        </div>
                                        <div className="totalMoneySpended w-full flex items-center justify-between">
                                            <h3>مجموع المبالغ المدفوعة</h3>
                                            <h3>{JSON.parse(clientSelected)?.orders.length > 0 ? JSON.parse(clientSelected).orders.map(order => order.total).reduce((a, b) => a + b) : 0} ج.م</h3>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    <div className="orderItemsList w-full min-h-72 bg-slate-100 p-1 rounded-xl my-3">
                        {itemsInOrder.map((item, ind) => (
                            <div className="item p-1 my-1 bg-bgColor rounded-xl flex items-center justify-between w-full" key={ind}>
                                <div className="image flex ml-2 items-center justify-center p-2 rounded-xl bg-yellow-500">
                                    <Image src={item.category === 'برجر' ? "/burger.png" : item.category === 'فرايز' ? "/fries.png" : item.category === "وجبات" ? "/meal.png" : "/offer.png"} width={50} height={50} alt='Item Icon' />
                                </div>
                                <div className="details h-full flex flex-col items-center justify-between p-2">
                                    <h4 className='mb-0.5'>{item.title} {item.isSpicy ? "Spicy" : ''}</h4>
                                    <p className='text-sm'>{item.without}</p>
                                    <p className='text-xs text-gray-400'>{+item.price} * {item.quantity} = {item.price * item.quantity}</p>
                                </div>
                                <div className='DeleteItem flex items-center justify-end'>
                                    <div onClick={() => removeItemFromOrder(ind)} className="deleteBtn p-2 rounded-xl cursor-pointer items-center bg-black text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">   <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <h2>تفاصيل الدفع:</h2>
                    <div className="payment border-t-2 my-2 px-1 py-2 text-sm">
                        <div className="flex items-center mb-2 justify-between w-full">
                            <h3 className='font-semibold'>المجموع الصافي</h3>
                            <h3>{subTotalItems(itemsInOrder)} ج.م</h3>
                        </div>
                        <div className="flex items-center mb-4 justify-between w-full">
                            <h3 className='font-semibold'>توصيل</h3>
                            <div className="Delevery flex items-center justify-center">
                                <div onClick={() => setDelivery(delivery + 5)} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg></div>
                                <h3 className=' mx-2'>{delivery}</h3>
                                <div onClick={() => {
                                    if (delivery >= 5) {
                                        setDelivery(delivery - 5)
                                    }
                                }} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                                </div>
                            </div>
                        </div>
                        {clientSelected && client === 'delivery' && (
                            <>
                                <div className="flex items-center mb-2 justify-between w-full">
                                    <h3>العنوان</h3>
                                    <h3>{JSON.parse(clientSelected)?.address}</h3>
                                </div>
                                <div className="flex items-center mb-4 justify-between w-full">
                                    <h3>رقم الهاتف</h3>
                                    <h3>{JSON.parse(clientSelected)?.phone}</h3>
                                </div>
                            </>

                        )}
                        <div className="flex items-center mb-2 justify-between w-full">
                            <h3 dir='rtl' className='font-semibold'>ضريبة ق.م %14</h3>
                            <div className="Delevery flex items-center justify-center">
                                <div onClick={() => setTaxs(Math.trunc((subTotalItems(itemsInOrder) * 0.14)))} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg></div>
                                <h3 className=' mx-2'>{taxs}</h3>
                                <div onClick={() => {
                                    if (taxs >= 0) {
                                        setTaxs(0)
                                    }
                                }} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center mb-8 justify-between w-full">
                            <h3 className='font-semibold'>خصم 10%</h3>
                            <div className="Delevery flex items-center justify-center">
                                <div onClick={() => setDiscount(Math.trunc(subTotalItems(itemsInOrder) - (subTotalItems(itemsInOrder) * (90 / 100))))} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">   <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /> </svg></div>
                                <h3 className=' mx-2'>{discount}</h3>
                                <div onClick={() => {
                                    if (discount >= 5) {
                                        setDiscount(0)
                                    }
                                }} className="QBtn cursor-pointer p-1 rounded-xl flex items-center justify-center border-2 border-blackColor hover:bg-blackColor hover:text-bgColor"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex font-bold text-lg items-center justify-between w-full ">
                            <h3>اجمالي الفاتورة</h3>
                            <h3>{mainTotalItemsPrice()} ج.م</h3>
                        </div>
                        <div className="paymentMethod flex items-center justify-between w-full my-3">
                            <h2 className='text-lg font-semibold'>الدفع: </h2>
                            <div className="btns flex items-center justify-center">
                                <button onClick={() => setPayment("Visa")} className={`${payment === 'Visa' ? "bg-black text-bgColor" : "text-black bg-bgColor"} cbtn border-2 border-black`}>Visa</button>
                                <button onClick={() => setPayment("Cash")} className={`${payment === 'Cash' ? "bg-black text-bgColor" : "text-black bg-bgColor"} cbtn border-2 border-black`}>Cash</button>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => AddInvoice()} className='submitBtn w-full'>{alert ? alert : "إنشاء الفاتورة"}</button>
                </div>
            </div>
            <div className={`InvoiceContainer absolute overflow-hidden top-0 left-0 bg-white flex flex-col items-center justify-start ${showInvoice ? "w-full h-full rounded-none opacity-100" : "opacity-0 w-0 h-0  rounded-xl"} duration-700`}>
                {showInvoice && <button onClick={() => {
                    setShowInvoice(!showInvoice)
                    setClientSelected(null)
                    setClientName('')
                    setClientPhone('')
                    setClientAddress('')
                    setClientDelivery(0)
                    setClientPoints(0)
                    setClientOrders([])
                    setClientId('')
                    setClient(`Take Away`)
                }} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>}
                <div className="Invoice w-80 p-3 py-4 rounded-xl flex items-center justify-center flex-col border-2 border-mainColor mt-4">
                    <Image src={'/bwLogo.png'} width={70} height={70} alt='logo' />
                    <div className="head flex items-center text-center justify-center mt-2 w-full">
                        <div className="date">
                            <h2>التاريخ: {FormatedDate(new Date())}</h2>
                        </div>
                    </div>
                    <div className="flex font-medium text-sm border-b-2 pt-4 items-center justify-between w-full">
                        <h3 className='font-semibold'>العميل</h3>
                        <h4 className='text-2xl'>#{invoiceId}</h4>
                        <h3>{client === 'delivery' ? JSON.parse(clientSelected)?.name || "اسم العميل" : client}</h3>
                    </div>
                    <div className="body w-full">
                        <div className="items w-full flex flex-col justify-start items-start my-2">
                            {itemsInOrder.map((item, ind) => (
                                <div className="item flex flex-row w-full justify-between items-center my2" key={ind}>
                                    <div className="title flex flex-col items-start justify-center">
                                        <h2 className='font-medium'>{item.title} {item.isSpicy ? "Spicy" : ""}</h2>
                                        <p className='text-sm'>{item.without}</p>
                                        <p className='text-sm font-semibold text-black'>{+item.price} * {item.quantity}</p>
                                    </div>
                                    <div className="price">
                                        <h2>L.E {item.price * item.quantity}</h2>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="total text-sm flex flex-col w-full">
                            <div className="flex items-center mb-2 justify-between w-full">
                                <h3 className='font-semibold'>المجموع الصافي</h3>
                                <h3>{subTotalItems(itemsInOrder)} L.E</h3>
                            </div>
                            {delivery > 0 && (
                                <div className="flex items-center mb-2 justify-between w-full">
                                    <h3 className='font-semibold'>التوصيل</h3>
                                    <h3>{delivery} L.E</h3>
                                </div>
                            )}
                            {clientSelected && client === 'delivery' && (
                                <>
                                    <div className="flex flex-col items-start mb-2 justify-between w-full">
                                        <h3 className='mb-1'>العنوان:</h3>
                                        <h3>{JSON.parse(clientSelected)?.address}</h3>
                                    </div>
                                    <div className="flex items-center mb-2 justify-between w-full">
                                        <h3>رقم الهاتف</h3>
                                        <h3>{JSON.parse(clientSelected)?.phone}</h3>
                                    </div>
                                </>
                            )}
                            {taxs > 0 && (
                                <div className="flex items-center mb-2 justify-between w-full">
                                    <h3 dir='rtl' className='font-semibold'>ضريبة ق.م %14</h3>
                                    <h3>{taxs} L.E</h3>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex items-center mb-2 justify-between w-full">
                                    <h3 className='font-semibold'>الخصم</h3>
                                    <h3>{discount} L.E</h3>
                                </div>
                            )}
                            <div className="flex font-bold text-lg border-t-2 pt-1 items-center mb-2 justify-between w-full">
                                <h3 className='font-semibold'>إجمالي الفاتورة</h3>
                                <h3>{mainTotalItemsPrice()} L.E</h3>
                            </div>
                            <div className="flex font-bold text-sm border-t-2 pt-1 items-center mb-2 justify-between w-full">
                                <h3 className='font-semibold'>طريقة الدفع</h3>
                                <h3>{payment}</h3>
                            </div>
                        </div>
                        <div className="foot">
                            <h6 className='text-xs text-gray-700'>الكاشير: {User.name}</h6>
                        </div>
                        <div className="details flex flex-col items-center justify-center mt-4">
                            <p className='text-xs text-center'>90 عمارات الظباط - مصطفي كامل - الاسكندرية</p>
                            <p className='text-sm text-center'>01279995354 - 035416691</p>
                            <h6 dir='rtl' className='mt-1 text-gray-700'>شكراً لزيارتكم</h6>
                        </div>
                    </div>
                </div>
                <div className="btns w-80 mt-3">
                    <button onClick={() => sendOrderAndPrint()} className='submitBtn w-80'>طباعة الفاتورة</button>
                    {User.role === "المالك" && (
                        <>
                            {indexToDelete !== null && (
                                <>
                                    <button onClick={() => DeleteInvoiceFromShift(indexToDelete)} className='text-textColor my-3 bg-red-500 font-bold text-base flex items-center justify-center py-1 px-4 border-2 rounded-full cursor-pointer w-full'>حذف الفاتورة</button>
                                </>

                            )}
                            {showInvoices && (
                                <button onClick={() => updateShift()} className='text-bgColor my-3 bg-mainColor font-bold text-base flex items-center justify-center py-1 px-4 border-2 rounded-full cursor-pointer w-full'>تحديث الفواتير</button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={`AddExpenseContainer absolute overflow-hidden bottom-0 left-0 bg-white flex flex-col items-center justify-center ${showAddExpense ? "w-full h-full rounded-none opacity-100" : "opacity-0 w-0 h-0  rounded-xl"} duration-700`}>
                {showAddExpense && <button onClick={() => setShowAddExpense(!showAddExpense)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>}
                <form onSubmit={AddExpense}>
                    <div className="reason w-full mb-3 lg:mb-5">
                        <label className='text-xl font-semibold' htmlFor="reason">أذكر سبب الصرف:</label>
                        <input className='w-full my-2' type="text" name="reason" value={reason} onChange={(e) => setreason(e.target.value)} id="title" placeholder='سبب الصرف' />
                    </div>
                    <div className="value w-full mb-3 lg:mb-5">
                        <label className='text-xl font-semibold' htmlFor="value">قيمة الصرف:</label>
                        <input className='w-full my-2' type="number" name="value" value={value} onChange={(e) => setvalue(e.target.value)} id="title" placeholder='القيمة' />
                    </div>
                    <div className="description w-full mb-3 lg:mb-5">
                        <label className='text-xl font-semibold' htmlFor="description">تفاصيل اخرى :</label>
                        <textarea className='my-2 w-full' name="description" id="description" value={description} onChange={(e) => setdescription(e.target.value)} placeholder='تفاصيل اخرى'></textarea>
                    </div>
                    <button className='submitBtn w-full'>{alert ? alert : "إضافة الصرف"}</button>
                </form>
                <div className="btns w-80 mt-3">
                    <button onClick={() => sendExpense()} className='submitBtn'>تأكيد الصرف</button>
                </div>
            </div>

            <div className={`ReportShift absolute overflow-auto bottom-0 right-0 bg-white flex flex-col items-center justify-start p-5 ${showReport ? "w-full h-full rounded-none opacity-100" : "opacity-0 w-0 h-0  rounded-xl"} duration-700`}>
                {showReport && <button onClick={() => setShowReport(!showReport)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>}
                <div className="summaryInvoices w-full flex flex-col items-center justify-start">
                    <div className="invoices w-full lg:w-8/12 p-2 border-2 border-mainColor">
                        <h4 className='text-base mb-1 text-gray-500'>تاريخ الفتح: {FormatedDate(shift.createdAt)}</h4>
                        <h4 className='text-base mb-1 text-gray-500'>بواسطة: {shift.casher}</h4>
                        <h4 className='text-base mb-5 text-gray-500'>تاريخ الاغلاق: {FormatedDate(new Date())}</h4>

                        <div className="sammary w-full my-5">
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي الفواتير</h2>
                                <h3 className='text-sm'>{totalIncome()} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي الصرف</h2>
                                <h3 className='text-sm'>{totalExpenses()} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي الوردية</h2>
                                <h3 className='text-sm'>{totalRefund()} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي الدفع الكاش</h2>
                                <h3 className='text-sm'>{totalPayment('Cash')} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي دفع الفيزا</h2>
                                <h3 className='text-sm'>{totalPayment('Visa')} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>إجمالي الخصومات</h2>
                                <h3 className='text-sm'>{totalDiscounts()} L.E</h3>
                            </div>
                            <div className="flex items-center justify-between w-full">
                                <h2 className='text-sm font-bold mb-2'>عدد الطلبات</h2>
                                <h3 className='text-sm'>{shift.invoices.length} طلب</h3>
                            </div>
                        </div>
                        <h3 className='text-xl font-bold'>الفواتير خلال الوردية: </h3>
                        {invoices.map((invoice, ind) => (
                            <div key={ind} className="invoice w-full flex flex-col items-start justify-start my-2 p-2">
                                <div className="totalInvoice flex items-center justify-between w-full">
                                    <h2 className='text-base font-semibold mb-2'>{ind + 1} - إجمالي الفاتورة</h2>
                                    <h3 className='text-base'>{invoice.total} L.E</h3>
                                </div>
                            </div>
                        ))}
                        {expenses.length > 0 && (
                            <>
                                <h3 className='text-xl font-bold'>المصروفات خلال الوردية: </h3>
                                {expenses.map((expense, ind) => (
                                    <div key={ind} className="expense w-full flex flex-col items-start justify-start my-2 p-2">
                                        <h4 className='text-xs text-gray-500'>الكاشير: {expense.user}</h4>
                                        <div className="flex items-center justify-between w-full">
                                            <h2 className='text-sm font-bold mb-2'>سبب الصرف</h2>
                                            <h3 className='text-sm'>{expense.reason} L.E</h3>
                                        </div>
                                        <div className="flex items-center justify-between w-full">
                                            <h2 className='text-sm font-bold mb-2'>قيمة الصرف</h2>
                                            <h3 className='text-sm'>{+expense.value} L.E</h3>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                    </div>

                    <div className="btns w-80 my-3">
                        <button onClick={() => CloseShift()} className='submitBtn'>طباعة التقرير</button>
                    </div>
                </div>
            </div>

            <div className={`addClient duration-500 ${showAddClient ? "w-full h-full opacity-100" : "w-0 h-0 opacity-0"} overflow-hidden absolute top-0 left-0 bg-white flex items-center justify-center`}>
                {showAddClient && <button onClick={() => setShowAddClient(!showAddClient)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>}

                <div className="addClientForm w-80 p-5 border-2 border-mainColor rounded-xl">
                    <h2 className='text-xl font-bold'>إضافة عميل</h2>
                    <form onSubmit={showEditClient ? handleEditClient : handleAddClient}>
                        <div className="name w-full my-2">
                            <label className='text-xl font-semibold' htmlFor="name">الاسم:</label>
                            <input className='w-full my-2' type="text" name="name" value={clientName} onChange={(e) => setClientName(e.target.value)} id="name" placeholder='الاسم' />
                        </div>
                        <div className="phone w-full my-2">
                            <label className='text-xl font-semibold' htmlFor="phone">رقم الهاتف:</label>
                            <input className='w-full my-2' type="text" name="phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} id="phone" placeholder='رقم الهاتف' />
                        </div>
                        <div className="address w-full my-2">
                            <label className='text-xl font-semibold' htmlFor="address">العنوان:</label>
                            <textarea className='w-full my-2 rounded-xl text-sm' name="address" id="address" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder='العنوان'></textarea>
                        </div>
                        <button className='submitBtn w-full'>{alert ? alert : `${showEditClient ? `تعديل` : `إضافة`} العميل`}</button>
                    </form>
                </div>
            </div>

        </>
    )
}
