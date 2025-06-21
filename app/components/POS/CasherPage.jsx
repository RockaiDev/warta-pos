'use client'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import socket from '@/libs/socket'

export default function CasherPage({ shift, items, User, clientsFromDB, }) {
    const [category, setCategory] = useState('')
    const [clients, setClients] = useState(clientsFromDB)
    const invoicesFromLocalStorage = JSON.parse(localStorage.getItem('invoices'))
    if (!invoicesFromLocalStorage) {
        localStorage.setItem('invoices', JSON.stringify([]))
    }
    const [invoices, setInvoices] = useState(shift.invoices)
    const [showInvoices, setShowInvoices] = useState(false)
    const [expenses, setExpenses] = useState(shift.expenses)
    const [showAddExpense, setShowAddExpense] = useState(false)
    const [alert, setAlert] = useState('')
    
    // نظام الطلبات
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // Socket.IO listeners
    useEffect(() => {
        // للتحقق من الاتصال
        socket.on("connect", () => {
            console.log("✅ السيرفر شغال زي الفل - Socket ID:", socket.id);
        });

        // للتحقق من الأخطاء
        socket.on("connect_error", (error) => {
            console.error("❌ خطأ في الاتصال:", error.message);
        });

        // عشان اتاكد ان الي طالب طلب الاوردر
        socket.on('newOrderNotification', (data) => {
            console.log('✅ تأكيد الطلب:', data);
            setAlert(data.message);
        });

        // استقبال إشعارات الطلبات الجديدة
        socket.on('newOrderNotification', (data) => {
            console.log(data.order);
            console.log({
                type: data.order.type,
                phone: data.order.phone,
                totalPrice: data.order.totalPrice,
                itemsCount: data.order.itemsCount,
                paymentMethod: data.order.paymentMethod,
                timestamp: data.order.timestamp
            });
            
            // إضافة الإشعار للقائمة
            const newNotification = {
                id: Date.now(),
                message: `طلب جديد! رقم الهاتف: ${data.order.phone || 'غير محدد'}`,
                order: data.order,
                isRead: false,
                createdAt: new Date(),
                timestamp: data.order.timestamp || new Date().toISOString()
            };
            
            setNotifications(prev => {
                const updatedNotifications = [newNotification, ...prev];
                // حفظ في localStorage
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                return updatedNotifications;
            });
            setUnreadCount(prev => prev + 1);
        });

        // استرجاع الطلبات من localStorage
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            const parsedNotifications = JSON.parse(savedNotifications);
            setNotifications(parsedNotifications);
            setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
        }

        return () => {
            socket.off('connect');
            socket.off('connect_error');
            socket.off('orderConfirmation');
            socket.off('newOrderNotification');
        };
    }, []);

    // أضف متغيرات الطلبات
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // متغيرات طلبات الموقع
    const [webOrders, setWebOrders] = useState([])
    const [showWebOrders, setShowWebOrders] = useState(false)

// object.order.sorce
    // فواتير منفصلة حسب المصدر
    const [cashierInvoices, setCashierInvoices] = useState([])
    const [webInvoices, setWebInvoices] = useState([])

    // 1. إضافة متغير حالة لتخزين الفاتورة المختارة
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // عداد لطلبات الموقع
    const [webOrderCounter, setWebOrderCounter] = useState(1);

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

    // دوال إدارة الطلبات
    const markAsRead = (notificationId) => {
        setNotifications(prev => {
            const updated = prev.map(notif => 
                notif.id === notificationId 
                    ? { ...notif, isRead: true }
                    : notif
            );
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    const markAllAsRead = () => {
        setNotifications(prev => {
            const updated = prev.map(notif => ({ ...notif, isRead: true }));
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(0);
    }

    const deleteNotification = (notificationId) => {
        setNotifications(prev => {
            const updated = prev.filter(notif => notif.id !== notificationId);
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    }

    // دالة إنشاء فاتورة من الطلب
    const createInvoiceFromNotification = (orderData) => {
        if (!orderData) return;
        
        // إنشاء فاتورة جديدة من بيانات الطلب
        const newInvoice = {
            client: orderData.phone || 'Take Away',
            items: [], // لا توجد تفاصيل المنتجات في البيانات
            total: orderData.totalPrice || 0,
            discount: 0,
            taxs: 0,
            delivery: 0,
            user: User.name,
            payment: orderData.paymentMethod || 'Cash',
            branch: shift.branch,
            id: invoices.length + 1
        };
        
        // إضافة الفاتورة للقائمة
        const updatedInvoices = [...invoices, newInvoice];
        setInvoices(updatedInvoices);
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
        
        setAlert('تم إنشاء الفاتورة من الطلب بنجاح');
        setShowNotifications(false);
    }

    // إغلاق popup عند النقر خارجه
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showNotifications && !event.target.closest('.notification-popup')) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

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
        items.forEach(item => {
            const price = parseFloat(item.price) || 0
            const quantity = parseInt(item.quantity) || 0
            totalItemsPrice = totalItemsPrice + (price * quantity)
        })
        return totalItemsPrice
    }

    const mainTotalItemsPrice = () => {
        let totalItemsPrice = subTotalItems(itemsInOrder) || 0
        let mainTotal = (totalItemsPrice + (delivery || 0) + (taxs || 0)) - (discount || 0)
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
        id: invoices.length + 1,
        source: 'cashier' // إضافة source للفواتير العادية
    }

    // Handle Invoice ************************
    const AddInvoice = async () => {
        if (itemsInOrder.length > 0) {
            setAlert('جاري إنشاء الفاتورة...')
            
            try {
                // إنشاء الفاتورة مع source: 'cashier'
                const newInvoice = {
                    ...invoice,
                    source: 'cashier'
                };
                
                // إنشاء الطلب لحفظه في قاعدة البيانات
                const totalPrice = mainTotalItemsPrice() || 0;
                const newOrder = {
                    name: client === 'delivery' ? (JSON.parse(clientSelected)?.name || 'عميل توصيل') : client,
                    email: '',
                    image: '',
                    items: itemsInOrder,
                    totalPrice: totalPrice,
                    phoneNum: client === 'delivery' ? (JSON.parse(clientSelected)?.phone || '') : '',
                    address: client === 'delivery' ? (JSON.parse(clientSelected)?.address || '') : 'In The Branch',
                    paymentMethod: payment,
                    status: 'completed',
                    source: selectedInvoice && selectedInvoice.source === 'web' ? 'web' : 'cashier'
                };
                
                // حفظ الفاتورة في قاعدة البيانات
                const resInvoice = await fetch('/api/invoices', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(newInvoice)
                });
                
                // حفظ الطلب في قاعدة البيانات
                const resOrder = await fetch('/api/orders', {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify(newOrder)
                });
                
                if (resInvoice.ok && resOrder.ok) {
                    // إضافة الفاتورة للقائمة المحلية
                    let invoicesHandle = [...invoices, newInvoice];
                    setInvoiceId(newInvoice.id);
                    setInvoices(invoicesHandle);
                    setAlert('تم إنشاء الفاتورة والطلب بنجاح');
                    setShowInvoice(true);
                    
                    // حفظ في localStorage
                    localStorage.setItem('invoices', JSON.stringify(invoicesHandle));
                    
                    // إذا كان عميل توصيل، أضف الطلب للعميل
                    if (client === 'delivery') {
                        AddOrderToClient();
                    }
                } else {
                    setAlert('حدث خطأ في إنشاء الفاتورة أو الطلب');
                }
            } catch (error) {
                console.log(error);
                setAlert('حدث خطأ في إنشاء الفاتورة');
            }
        } else {
            setAlert('لا يوجد شيء في الفاتورة');
        }
    }

    const sendOrderAndPrint = async () => {
        if (client === 'delivery' && (!clientSelected || clientSelected === 'null')) {
            setAlert('برجاء اختيار عميل للتوصيل');
            return;
        }
        let newInvoice = {
            client: client,
            items: [...itemsInOrder],
            total: mainTotalItemsPrice(),
            discount: discount,
            taxs: taxs,
            delivery: delivery,
            user: User.name,
            payment: payment,
            branch: shift.branch,
            id: invoices.length + 1,
            source: 'cashier' // إضافة source للفواتير العادية
        };
        // إذا كانت فاتورة ويب أضف خاصية source: 'web'
        if (selectedInvoice && selectedInvoice.source === 'web') {
            newInvoice = { ...newInvoice, source: 'web' };
        }
        
        // إنشاء الطلب لحفظه في قاعدة البيانات
        const totalPrice = mainTotalItemsPrice() || 0;
        const newOrder = {
            name: client === 'delivery' ? (JSON.parse(clientSelected)?.name || 'عميل توصيل') : client,
            email: '',
            image: '',
            items: itemsInOrder,
            totalPrice: totalPrice,
            phoneNum: client === 'delivery' ? (JSON.parse(clientSelected)?.phone || '') : '',
            address: client === 'delivery' ? (JSON.parse(clientSelected)?.address || '') : 'In The Branch',
            paymentMethod: payment,
            status: 'completed',
            source: selectedInvoice && selectedInvoice.source === 'web' ? 'web' : 'cashier'
        };
        
        try {
            const resInvoice = await fetch('/api/invoices', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newInvoice)
            })
            
            // حفظ الطلب في قاعدة البيانات
            const resOrder = await fetch('/api/orders', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newOrder)
            });
            
            const updatedInvoices = [...invoices, newInvoice];
            setInvoices(updatedInvoices);
            localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
            const resShift = await fetch(`/api/shifts/${shift._id}`, {
                method: "PUT",
                headers: {
                    "Content-type": 'application/json'
                },
                body: JSON.stringify({ invoices: updatedInvoices })
            })
<<<<<<< HEAD

            if (resInvoice.ok && resShift.ok) {
                // إرسال الطلب عبر Socket.IO
                const orderData = {
                    id: invoice.id,
                    client: client,
                    items: itemsInOrder,
                    total: mainTotalItemsPrice(),
                    discount: discount,
                    taxs: taxs,
                    delivery: delivery,
                    payment: payment,
                    branch: shift.branch,
                    user: User.name,
                    phone: client === 'delivery' && clientSelected ? JSON.parse(clientSelected).phone : 'Take Away',
                    address: client === 'delivery' && clientSelected ? JSON.parse(clientSelected).address : '',
                    timestamp: new Date().toISOString()
                };

                //إرسال الطلب الجديد للسيرفر
                socket.emit('newOrder', orderData);
                console.log('📤 تم إرسال الطلب:', orderData);

                setAlert('تم إنشاء الطلب بنجاح');
=======
            if (resInvoice.ok && resShift.ok && resOrder.ok) {
                setAlert('تم إنشاء الطلب والفاتورة بنجاح')
>>>>>>> farestest
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
        setAlert('جاري تحديث الوردية..')
        localStorage.setItem('invoices', JSON.stringify(invoices))
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


<<<<<<< HEAD
    // Handle Invoice ************************


=======
>>>>>>> farestest
    // Close Shift ****************************
    const [showReport, setShowReport] = useState(false)

    let status = 'close'
    let close = User.name
    const CloseShift = async () => {
        const confirmed = confirm('هل تريد اغلاق الوردية؟')
        if (confirmed) {
            setAlert('جاري اغلاق الوردية..')
            localStorage.removeItem('invoices')
            try {
                const res = await fetch(`/api/shifts/${shift._id}`, {
                    method: "PUT",
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({ status, close })
                })

                if (res.ok) {
                    setAlert('جاري طباعة التقرير..')
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
            setAlert('جاري حذف الوردية..')
            localStorage.removeItem('invoices')
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
        if (selectedInvoice && selectedInvoice.source === 'web') {
            // حذف من فواتير الويب فقط
            const updatedInvoices = invoices.filter(inv => inv.id !== selectedInvoice.id || inv.source !== 'web');
            setInvoices(updatedInvoices);
        } else {
            // حذف من فواتير الكاشير فقط
            const updatedInvoices = invoices.filter(inv => inv.id !== selectedInvoice.id || inv.source === 'web');
            setInvoices(updatedInvoices);
        }
        setIndexToDelete(null);
        setShowInvoice(false);
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
        if (!clientName || !clientPhone || !clientAddress) {
            setAlert('كل البيانات مطلوبة')
            return
        }
        try {
            const res = await fetch('/api/clients', {
                method: "POST",
                headers: {

                    'Content-type': 'application/json'
                },
                body: JSON.stringify({ name: clientName, phone: clientPhone, address: clientAddress, delivery: clientDelivery, points: clientPoints, _id: clients.length + 1 })
            })

            if (res.ok) {
                const Allclients = [...clients, { name: clientName, phone: clientPhone, address: clientAddress, delivery: clientDelivery, points: clientPoints, orders: [] }]
                setClients(Allclients)
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
        const matchedClient = (client.name || "").toLowerCase().includes(searchClient.toLowerCase())
        const matchedPhone = client.phone.includes(searchClient)
        return matchedClient || matchedPhone
    }).reverse()


    const FormatedDate = (date) => {
        const CreateDate = new Date(date)
        // Format the date
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = CreateDate.toLocaleString('ar-EG', options);
        return formattedDate
    }



    invoices.map(invoice => {
        console.log(invoicesFromLocalStorage?.some(localInvoice => localInvoice.id === invoice.id))
    })

    // استقبال الطلبات الجديدة
    useEffect(() => {
        socket.on('newOrderNotification', (data) => {
            console.log('Received order data:', data);

            // التأكد من أن البيانات تحتوي على order
            const orderData = data.order || data;
            
            const newNotification = {
                id: Date.now(),
                message: `طلب جديد! رقم الهاتف: ${orderData.phoneNum || orderData.phone || 'غير محدد'}`,
                order: orderData,
                isRead: false,
                createdAt: new Date(),
                timestamp: orderData.timestamp || new Date().toISOString()
            };
            setNotifications(prev => {
                const updatedNotifications = [newNotification, ...prev];
                localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
                return updatedNotifications;
            });
            setUnreadCount(prev => prev + 1);

            // إضافة الطلب إلى قائمة طلبات الموقع
            addWebOrder(orderData);
        });
        // استرجاع الطلبات من localStorage
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications) {
            const parsedNotifications = JSON.parse(savedNotifications);
            setNotifications(parsedNotifications);
            setUnreadCount(parsedNotifications.filter(n => !n.isRead).length);
        }
        return () => {
            socket.off('newOrderNotification');
        };
    }, []);

    // فصل الفواتير حسب المصدر (العرض)
    useEffect(() => {
        const cashierInvs = invoices.filter(invoice => invoice.source !== 'web');
        const webInvs = invoices.filter(invoice => invoice.source === 'web');
        setCashierInvoices(cashierInvs);
        setWebInvoices(webInvs);
    }, [invoices]);

    // دوال الطلبات والتنبيهات
    const addWebOrder = (order) => {
        const newWebOrder = {
            id: Date.now(),
            order: order,
            createdAt: new Date()
        };

        setWebOrders(prev => [newWebOrder, ...prev]);
    };

    const markAsRead = (notificationId) => {
        setNotifications(prev => {
            const updated = prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            );
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => {
            const updated = prev.map(n => ({ ...n, isRead: true }));
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(0);
    };

    const deleteNotification = (notificationId) => {
        setNotifications(prev => {
            const updated = prev.filter(n => n.id !== notificationId);
            localStorage.setItem('notifications', JSON.stringify(updated));
            return updated;
        });
        setUnreadCount(prev => {
            const notification = notifications.find(n => n.id === notificationId);
            return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
    };

    const createInvoiceFromNotification = (orderData, notificationId) => {
        if (!orderData) {
            setAlert('بيانات الطلب غير صحيحة');
            return;
        }

        // تحويل بيانات الطلب من weborder إلى تنسيق الفاتورة
        const invoiceItems = orderData.items ? orderData.items.map(item => ({
            title: item.itemInfo?.titleAr || item.name || item.title || 'منتج غير محدد',
            price: item.totalPrice || item.price || 0,
            quantity: item.quantity || 1,
            category: item.itemInfo?.category || item.category || 'عام',
            isSpicy: item.isSpicy || false,
            without: item.without || ''
        })) : [{
            title: 'طلب موقع',
            price: orderData.totalPrice || 0,
            quantity: orderData.itemsCount || 1,
            category: 'عام',
            isSpicy: false,
            without: ''
        }];

        setItemsInOrder(invoiceItems);
        setClient(orderData.address && orderData.address !== 'In The Branch' ? 'delivery' : 'Take Away');
        setPayment(orderData.paymentMethod || 'Cash');
        setDelivery(0); // يمكن تعديل هذا حسب الحاجة
        setTaxs(0);
        setDiscount(0);
        setInvoiceId(webOrderCounter);
        
        // إنشاء فاتورة مؤقتة مع source: 'web'
        const tempInvoice = {
            id: webOrderCounter,
            client: orderData.address && orderData.address !== 'In The Branch' ? 'delivery' : 'Take Away',
            items: invoiceItems,
            total: invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            discount: 0,
            taxs: 0,
            delivery: 0,
            user: User.name,
            payment: orderData.paymentMethod || 'Cash',
            branch: shift.branch,
            source: 'web' // تحديد مصدر الفاتورة
        };
        setSelectedInvoice(tempInvoice);
        
        // زيادة العداد
        setWebOrderCounter(prev => prev + 1);
        
        setShowNotifications(false);
        setShowInvoice(true);
        setAlert('تم تجهيز الفاتورة، الرجاء التأكيد من الأسفل');
        if (notificationId) markAsRead(notificationId);
        
        // لا نحذف العناصر هنا لأننا نريد عرضها في الفاتورة
        // setItemsInOrder([]);
    };

    const createInvoiceFromWebOrder = async (orderData) => {
        if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
            setAlert('بيانات الطلب غير صحيحة');
            return;
        }

        setAlert('جاري إنشاء الفاتورة...');

        try {
            const invoiceItems = orderData.items.map(item => ({
                title: item.itemInfo?.titleAr || item.name || item.title || 'منتج غير محدد',
                price: item.totalPrice || item.price || 0,
                quantity: item.quantity || 1,
                category: item.itemInfo?.category || item.category || 'عام',
                isSpicy: item.isSpicy || false,
                without: item.without || ''
            }));

            const totalPrice = invoiceItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // إنشاء الفاتورة
            const newInvoice = {
                client: orderData.address && orderData.address !== 'In The Branch' ? 'delivery' : 'Take Away',
                items: invoiceItems,
                total: totalPrice,
                discount: 0,
                taxs: 0,
                delivery: 0,
                user: User.name,
                payment: orderData.paymentMethod || orderData.payment || 'Cash',
                branch: shift.branch,
                id: invoices.length + 1,
                source: 'web'
            };

            // إنشاء الطلب لحفظه في قاعدة البيانات
            const newOrder = {
                name: orderData.name || 'عميل موقع',
                email: orderData.email || '',
                image: '',
                items: orderData.items,
                totalPrice: totalPrice,
                phoneNum: orderData.phoneNum || '',
                address: orderData.address || 'In The Branch',
                paymentMethod: orderData.paymentMethod || 'Cash',
                status: 'completed',
                source: 'web'
            };

            // حفظ الفاتورة في قاعدة البيانات
            const resInvoice = await fetch('/api/invoices', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newInvoice)
            });

            // حفظ الطلب في قاعدة البيانات
            const resOrder = await fetch('/api/orders', {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newOrder)
            });

            if (resInvoice.ok && resOrder.ok) {
                // إضافة الفاتورة للقائمة المحلية
                let invoicesHandle = [...invoices, newInvoice];
                setInvoices(invoicesHandle);
                
                // حفظ في localStorage
                localStorage.setItem('invoices', JSON.stringify(invoicesHandle));
                
                // إزالة الطلب من قائمة طلبات الموقع الجديدة
                setWebOrders(prev => prev.filter(order => order.order !== orderData));
                
                setAlert('تم إنشاء الفاتورة بنجاح');
                
                // عرض الفاتورة
                setSelectedInvoice(newInvoice);
                setItemsInOrder(invoiceItems);
                setPayment(newInvoice.payment);
                setDelivery(newInvoice.delivery);
                setTaxs(newInvoice.taxs);
                setClient(newInvoice.client);
                setDiscount(newInvoice.discount);
                setInvoiceId(newInvoice.id);
                setShowInvoice(true);
            } else {
                setAlert('حدث خطأ في إنشاء الفاتورة');
            }
        } catch (error) {
            console.log(error);
            setAlert('حدث خطأ في إنشاء الفاتورة');
        }
    };

    const updateInvoice = () => {
        if (itemsInOrder.length > 0) {
            const updatedInvoice = {
                ...invoice,
                items: itemsInOrder,
                total: mainTotalItemsPrice(),
                discount: discount,
                taxs: taxs,
                delivery: delivery,
                payment: payment,
                client: client
            };

            // تحديث الفاتورة في قائمة الفواتير
            const updatedInvoices = invoices.map(inv =>
                inv.id === updatedInvoice.id ? updatedInvoice : inv
            );
            setInvoices(updatedInvoices);

            // تحديث في localStorage
            localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

            setAlert('تم تحديث الفاتورة بنجاح');
            setTimeout(() => {
                setShowInvoice(false);
                setAlert('');
            }, 1500);
        } else {
            setAlert('لا يوجد شيء في الفاتورة');
        }
    };

    // Loyalty Points System
    const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
    const [loyaltyLoading, setLoyaltyLoading] = useState(false);
    const [loyaltyError, setLoyaltyError] = useState('');

    // عند اختيار العميل، جلب رصيد النقاط
    useEffect(() => {
        if (clientSelected && client !== 'Take Away') {
            try {
                const clientObj = JSON.parse(clientSelected);
                setLoyaltyPoints(clientObj.points || 0);
            } catch {
                setLoyaltyPoints(0);
            }
        } else {
            setLoyaltyPoints(0);
        }
    }, [clientSelected]);

    // حساب الخصم بالنقاط
    const loyaltyDiscount = useLoyaltyPoints ? Math.floor(loyaltyPoints / 100) * 10 : 0;

    // دالة لعرض أول 3 أرقام فقط من رقم الطلب
    const formatOrderNumber = (number) => {
        if (!number) return '000';
        const numStr = number.toString();
        return numStr.length >= 3 ? numStr.slice(-3) : numStr.padStart(3, '0');
    };

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
                    <li onClick={() => setShowNotifications(!showNotifications)} className='p-2 text-bgColor cursor-pointer mx-2 hover:text-mainColor hover:bg-bgColor rounded-full relative'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
<<<<<<< HEAD
                        {/* عداد الإشعارات غير المقروءة */}
=======
                        {/* عداد الطلبات غير المقروءة */}
>>>>>>> farestest
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </li>
                </ul>
            </div>

            <h2 className='font-bold text-2xl text-start w-full mt-5'>تفاصيل الوردية:</h2>
            <div className="Info flex items-center justify-center sm:justify-start flex-wrap my-5 w-full">
                <div onClick={() => {
                    // إغلاق جميع النوافذ أولاً
                    setShowInvoice(false)
                    setShowAddExpense(false)
                    setShowReport(false)
                    setShowNotifications(false)
                    // ثم فتح طلبات الكاشير
                    setShowInvoices(!showInvoices)
                    setShowWebOrders(false)
                }} className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-gray-100">
                    <h2 className='text-2xl font-bold'>الطلبات</h2>
                    <h3 className='text-xl text-yellow-800 font-bold'>{cashierInvoices.length} طلب</h3>
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
                {/* أزرار التبديل بين أنواع الطلبات */}
                <div className="orderTypeTabs w-full flex items-center justify-center mb-6">
                    <div className="bg-gray-200 rounded-lg p-1 flex">
                        <button
                            onClick={() => {
                                console.log('تم الضغط على طلبات الكاشير')
                                setShowInvoices(true)
                                setShowWebOrders(false)
                            }}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                                showInvoices && !showWebOrders 
                                    ? 'bg-green-500 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            طلبات الكاشير ({cashierInvoices.length})
                        </button>
                        <button
                            onClick={() => {
                                // إغلاق جميع النوافذ أولاً
                                setShowInvoice(false)
                                setShowAddExpense(false)
                                setShowReport(false)
                                setShowNotifications(false)
                                // ثم فتح طلبات الموقع
                                setShowInvoices(false)
                                setShowWebOrders(true)
                            }}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                                showWebOrders && !showInvoices 
                                    ? 'bg-blue-500 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            طلبات الموقع ({webOrders.length + webInvoices.length})
                        </button>
                        <button
                            onClick={() => {
                                // إغلاق جميع النوافذ أولاً
                                setShowInvoice(false)
                                setShowAddExpense(false)
                                setShowReport(false)
                                setShowNotifications(false)
                                // ثم فتح عرض الكل
                                setShowInvoices(true)
                                setShowWebOrders(true)
                            }}
                            className={`px-4 py-2 rounded-md font-semibold transition-colors ${
                                showInvoices && showWebOrders 
                                    ? 'bg-purple-500 text-white' 
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            عرض الكل
                        </button>
                    </div>
                </div>

                {showInvoices && (
                    <div className="invoices w-full flex items-start justify-center flex-col">
                        <h2 className='text-xl mb-4 font-bold text-green-600'>فواتير الكاشير:</h2>
                        {cashierInvoices.length === 0 ? (
                            <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-xl">
                                لا توجد فواتير من الكاشير حالياً
                            </div>
                        ) : (
                            cashierInvoices.map((invoice, ind) => (
                                <div onClick={() => {
                                    setShowInvoice(!showInvoice)
                                    setSelectedInvoice(invoice)
                                    setItemsInOrder(invoice.items)
                                    setPayment(invoice.payment)
                                    setDelivery(invoice.delivery)
                                    setTaxs(invoice.taxs)
                                    setClient(invoice.client)
                                    setDiscount(invoice.discount)
                                    setInvoiceId(invoice.id)
                                    setIndexToDelete(ind)
                                }} className={`invoice cursor-pointer hover:bg-slate-50 hover:border-mainColor border-2 w-full p-2 flex items-center justify-between rounded-xl my-1 ${invoicesFromLocalStorage?.some(localInvoice => localInvoice.id === invoice.id) ? "bg-gray-300" : "bg-red-200"}`} key={ind}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-green-500 text-white p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className='font-bold text-lg'>فاتورة #{formatOrderNumber(invoice.id)}</h4>
                                            <p className='text-sm text-gray-600'>العميل: {invoice.client}</p>
                                            <p className='text-sm text-gray-600'>المجموع: {invoice.total} ج.م</p>
                                            <p className='text-sm text-gray-600'>الاصناف: {invoice.items.length} أصناف</p>
                                            <p className='text-sm text-gray-600'>طريقة الدفع: {invoice.payment}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowInvoice(!showInvoice)}
                                            className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            عرض الفاتورة
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* قسم طلبات الموقع */}
                {showWebOrders && (
                    <div className="webOrders w-full flex items-start justify-center flex-col mt-8">
                        <h2 className='text-xl mb-4 font-bold text-blue-600'>طلبات الموقع الجديدة:</h2>
                        {webOrders.length === 0 ? (
                            <div className="text-center text-gray-500 p-4 bg-blue-50 rounded-xl">
                                لا توجد طلبات جديدة من الموقع حالياً
                            </div>
                        ) : (
                            webOrders.map((webOrder, ind) => (
                                <div key={webOrder.id} className="webOrder cursor-pointer hover:bg-blue-50 hover:border-blue-400 border-2 w-full p-3 flex items-center justify-between rounded-xl my-2 bg-blue-100">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500 text-white p-2 rounded-full">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 21c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className='font-bold text-lg'>طلب جديد #{formatOrderNumber(webOrder.id)}</h4>
                                            <p className='text-sm text-gray-600'>العميل: {webOrder.order.address && webOrder.order.address !== 'In The Branch' ? 'توصيل' : 'استلام من الفرع'}</p>
                                            <p className='text-sm text-gray-600'>المجموع: {(webOrder.order.totalPrice || 0).toString()} ج.م</p>
                                            <p className='text-sm text-gray-600'>الاصناف: {(webOrder.order.items ? webOrder.order.items.length : 0).toString()} منتج</p>
                                            <p className='text-sm text-gray-600'>طريقة الدفع: {webOrder.order.paymentMethod || 'غير محدد'}</p>
                                            {webOrder.order.phoneNum && (
                                                <p className='text-sm text-gray-600'>الهاتف: {webOrder.order.phoneNum}</p>
                                            )}
                                            {webOrder.order.address && webOrder.order.address !== 'In The Branch' && (
                                                <p className='text-sm text-gray-600'>العنوان: {webOrder.order.address}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => createInvoiceFromWebOrder(webOrder.order)}
                                            className="text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                                        >
                                            إنشاء فاتورة
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* قسم فواتير طلبات الموقع المحفوظة */}
                {showWebOrders && webInvoices.length > 0 && (
                    <div className="webInvoices w-full flex items-start justify-center flex-col mt-8">
                        <h2 className='text-xl mb-4 font-bold text-green-600'>فواتير طلبات الموقع المحفوظة:</h2>
                        {webInvoices.map((invoice, ind) => (
                            <div key={invoice.id} className="webInvoice cursor-pointer hover:bg-green-50 hover:border-green-400 border-2 w-full p-3 flex items-center justify-between rounded-xl my-2 bg-green-100">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500 text-white p-2 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className='font-bold text-lg'>فاتورة #{formatOrderNumber(invoice.id)}</h4>
                                        <p className='text-sm text-gray-600'>العميل: {invoice.client}</p>
                                        <p className='text-sm text-gray-600'>المجموع: {invoice.total} ج.م</p>
                                        <p className='text-sm text-gray-600'>الاصناف: {invoice.items.length} أصناف</p>
                                        <p className='text-sm text-gray-600'>طريقة الدفع: {invoice.payment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setShowInvoice(!showInvoice)
                                            setSelectedInvoice(invoice)
                                            setItemsInOrder(invoice.items)
                                            setPayment(invoice.payment)
                                            setDelivery(invoice.delivery)
                                            setTaxs(invoice.taxs)
                                            setClient(invoice.client)
                                            setDiscount(invoice.discount)
                                            setInvoiceId(invoice.id)
                                            setIndexToDelete(ind)
                                        }}
                                        className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-semibold transition-colors"
                                    >
                                        عرض الفاتورة
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* إغلاق div الخاص بقسم الطلبات */}
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
                        {/* رقم الفاتورة */}
                        {selectedInvoice && selectedInvoice.source === 'web' ? (
                            <h4 className='text-2xl'>
                                {(() => {
                                    // إذا كانت الفاتورة من طلبات الموقع، اعرض الرقم مباشرة
                                    if (selectedInvoice && selectedInvoice.source === 'web') {
                                        return `طلب رقم: ${formatOrderNumber(selectedInvoice.id)}`;
                                    }
                                    return formatOrderNumber(selectedInvoice.id);
                                })()}
                            </h4>
                        ) : (
                            <h4 className='text-2xl'>#{formatOrderNumber(selectedInvoice ? selectedInvoice.id : invoiceId)}</h4>
                        )}
                        {/* اسم العميل */}
                        {selectedInvoice && selectedInvoice.source === 'web' ? (
                            <h3>{selectedInvoice.client || 'طلب موقع'}</h3>
                        ) : (
                            <h3>{client === 'delivery' ? JSON.parse(clientSelected)?.name || "اسم العميل" : client}</h3>
                        )}
                    </div>
                    {/* تمييز مصدر الفاتورة */}
                    <div className="w-full flex items-center justify-center mt-1">
                        {selectedInvoice && selectedInvoice.source === 'web' ? (
                            <span className="text-xs font-bold text-blue-600">طلب موقع</span>
                        ) : (
                            <span className="text-xs font-bold text-green-700">{shift?.branch ? `فرع: ${shift.branch}` : ''}</span>
                        )}
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
                            {selectedInvoice && selectedInvoice.source === 'web' && selectedInvoice.address && selectedInvoice.address !== 'In The Branch' && (
                                <>
                                    <div className="flex flex-col items-start mb-2 justify-between w-full">
                                        <h3 className='mb-1'>العنوان:</h3>
                                        <h3>{selectedInvoice.address}</h3>
                                    </div>
                                    <div className="flex items-center mb-2 justify-between w-full">
                                        <h3>رقم الهاتف</h3>
                                        <h3>{selectedInvoice.phoneNum}</h3>
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


                        {/* section for print Invoice */}
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
                                <button onClick={() => DeleteInvoiceFromShift(indexToDelete)} className='text-textColor my-3 bg-red-500 font-bold text-base flex items-center justify-center py-1 px-4 border-2 rounded-full cursor-pointer w-full'>حذف الفاتورة</button>
                            )}
                            {selectedInvoice && selectedInvoice.source === 'web' && (
                                <button onClick={() => updateShift()} className='text-textColor my-3 bg-blue-500 font-bold text-base flex items-center justify-center py-1 px-4 border-2 rounded-full cursor-pointer w-full'>تحديث الفواتير</button>
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

            {/* Popup الطلبات */}
            {showNotifications && (
                <>
                    {/* Overlay لإغلاق popup */}
<<<<<<< HEAD
                    <div 
                        className="fixed inset-0 z-30"
                        onClick={() => setShowNotifications(false)}
                    ></div>
                    
=======
                    <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowNotifications(false)}
                    ></div>
>>>>>>> farestest
                    <div className="absolute top-20 left-6 z-40 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden notification-popup">
                        <div className="bg-mainColor text-bgColor p-4 flex items-center justify-between">
                            <h3 className="font-bold text-lg">الطلبات</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
<<<<<<< HEAD
                                    <button 
=======
                                    <button
>>>>>>> farestest
                                        onClick={markAllAsRead}
                                        className="text-sm bg-bgColor text-mainColor px-2 py-1 rounded hover:bg-opacity-80"
                                    >
                                        تحديد الكل كمقروء
                                    </button>
                                )}
<<<<<<< HEAD
                                <button 
=======
                                <button
>>>>>>> farestest
                                    onClick={() => setShowNotifications(false)}
                                    className="text-bgColor hover:text-gray-200"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
<<<<<<< HEAD
                        
=======
>>>>>>> farestest
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    لا توجد طلبات جديدة
                                </div>
                            ) : (
                                notifications.map((notification) => (
<<<<<<< HEAD
                                    <div 
                                        key={notification.id} 
=======
                                    <div
                                        key={notification.id}
>>>>>>> farestest
                                        className={`p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-2 h-2 rounded-full ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                                    <h4 className="font-semibold text-sm">{notification.message}</h4>
                                                </div>
<<<<<<< HEAD
                                                
                                                {notification.order && (
                                                    <div className="text-xs text-gray-600 space-y-1">
                                                        <p><strong>نوع الطلب:</strong> {notification.order.type === 'pickup' ? 'استلام من الفرع' : notification.order.type === 'delivery' ? 'توصيل' : (notification.order.type || 'غير محدد')}</p>
                                                        <p><strong>المجموع:</strong> {(notification.order.totalPrice || notification.order.total || 0).toString()} ج.م</p>
                                                        <p><strong>طريقة الدفع:</strong> {notification.order.paymentMethod || notification.order.payment || 'غير محدد'}</p>
                                                        <p><strong>عدد المنتجات:</strong> {(notification.order.itemsCount || (notification.order.items ? notification.order.items.length : 0)).toString()} منتج</p>
                                                        {notification.order.phone && (
                                                            <p><strong>الهاتف:</strong> {notification.order.phone}</p>
=======
                                                {notification.order && (
                                                    <div className="text-xs text-gray-600 space-y-1">
                                                        <p><strong>نوع الطلب:</strong> {notification.order.address && notification.order.address !== 'In The Branch' ? 'توصيل' : 'استلام من الفرع'}</p>
                                                        <p><strong>المجموع:</strong> {(notification.order.totalPrice || 0).toString()} ج.م</p>
                                                        <p><strong>طريقة الدفع:</strong> {notification.order.paymentMethod || 'غير محدد'}</p>
                                                        <p><strong>عدد المنتجات:</strong> {(notification.order.items ? notification.order.items.length : 0).toString()} منتج</p>
                                                        {notification.order.phoneNum && (
                                                            <p><strong>الهاتف:</strong> {notification.order.phoneNum}</p>
                                                        )}
                                                        {notification.order.address && notification.order.address !== 'In The Branch' && (
                                                            <p><strong>العنوان:</strong> {notification.order.address}</p>
>>>>>>> farestest
                                                        )}
                                                        {notification.order.timestamp && (
                                                            <p><strong>التاريخ:</strong> {notification.order.timestamp}</p>
                                                        )}
                                                    </div>
                                                )}
<<<<<<< HEAD
                                                
=======
>>>>>>> farestest
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {notification.timestamp ? notification.timestamp : new Date(notification.createdAt).toLocaleString('ar-EG')}
                                                </p>
                                            </div>
<<<<<<< HEAD
                                            
                                            <div className="flex flex-col gap-1 ml-2">
                                                {!notification.isRead && (
                                                    <button 
=======
                                            <div className="flex flex-col gap-1 ml-2">
                                                {!notification.isRead && (
                                                    <button
>>>>>>> farestest
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-blue-500 hover:text-blue-700 text-xs"
                                                    >
                                                        تحديد كمقروء
                                                    </button>
                                                )}
<<<<<<< HEAD
                                                <button 
                                                    onClick={() => createInvoiceFromNotification(notification.order)}
=======
                                                <button
                                                    onClick={() => createInvoiceFromNotification(notification.order, notification.id)}
>>>>>>> farestest
                                                    className="text-green-500 hover:text-green-700 text-xs bg-green-50 px-2 py-1 rounded"
                                                >
                                                    إنشاء فاتورة
                                                </button>
<<<<<<< HEAD
                                                <button 
=======
                                                <button
>>>>>>> farestest
                                                    onClick={() => deleteNotification(notification.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}

<<<<<<< HEAD
=======
            {/* Update Shift */}
            <div className="updateShift w-full flex items-start justify-center flex-col my-10">
                <h2 className='text-xl mb-4 font-bold'>تحديث الوردية:</h2>
                <div className="updateShiftBtn w-10/12 flex items-center justify-start flex-wrap">
                    <div onClick={updateShift} className="btn text-sm p-2 bg-mainColor w-96 text-center text-bgColor font-bold rounded-lg cursor-pointer mx-2">تحديث الوردية</div>
                </div>
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
                                    <h4 className='mb-0.5'>{item.title} {item.isSpicy ? "Spicy" : ""}</h4>
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
                    {clientSelected && client !== 'Take Away' && (
                        <div className="loyalty-points flex flex-col items-end my-2">
                            <div className="text-sm font-bold mb-1">رصيد نقاط العميل: <span className="text-green-600">{loyaltyPoints}</span></div>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useLoyaltyPoints}
                                    onChange={e => setUseLoyaltyPoints(e.target.checked)}
                                    className="ml-4"
                                    disabled={loyaltyPoints < 100}
                                />
                                <span className="text-xs">استخدم النقاط (كل 100 نقطة = خصم 10 جنيه)</span>
                            </label>
                            {useLoyaltyPoints && (
                                <div className="text-xs text-purple-700 mt-1">خصم النقاط: {loyaltyDiscount} ج.م</div>
                            )}
                            {loyaltyLoading && <div className="text-xs text-blue-500">جاري تحديث النقاط...</div>}
                            {loyaltyError && <div className="text-xs text-red-500">{loyaltyError}</div>}
                        </div>
                    )}
                </div>
            </div>
>>>>>>> farestest
        </>
    )
}
