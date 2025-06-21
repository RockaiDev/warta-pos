'use client'
import React, { useEffect, useState } from 'react'
import DateRangePicker from './DateRangePicker';
import Loading from '../main/Loading'
import * as XLSX from 'xlsx'
import { useDataContext } from '../context/DataContext';


export default function DashboardPage() {
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [filteredSalaries, setFilteredSalaries] = useState([]);
    const [filteredShifts, setFilteredShifts] = useState([]);
    const [filterBranch, setFilterBranch] = useState("All");
    const [webOrders, setWebOrders] = useState([]);
    const [casherOrders, setCasherOrders] = useState([]);
    
    const [isLoadingWebOrders, setIsLoadingWebOrders] = useState(true);

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [startDate, setStartDate] = useState(startOfDay);
    const [endDate, setEndDate] = useState(now);
    const [showShiftsList, setShowShiftsList] = useState(false);
    const [report, setReport] = useState(null);
    const [printingReport, setPrintingReport] = useState(false);

    const { expenses, invoices, salaries, shifts, branches } = useDataContext();

    

   










    const filterData = (start, end) => {
        const filterByDateAndBranch = (data, dateField) => {
            return data.filter(item => {
                const itemDate = new Date(item[dateField]);
                const branchFilter = filterBranch === "All" || filterBranch === "" || item.branch === filterBranch;
                return itemDate >= start && itemDate <= end && branchFilter;
            });
        };

        setFilteredExpenses(filterByDateAndBranch(expenses, "createdAt"));
        setFilteredInvoices(filterByDateAndBranch(invoices, "createdAt"));
        setFilteredSalaries(filterByDateAndBranch(salaries, "createdAt"));
        setFilteredShifts(
            shifts.filter(shift => {
                const shiftDate = new Date(shift.createdAt);
                const isClosed = shift.status === "close";
                const branchFilter = filterBranch === "All" || filterBranch === "" || shift.branch === filterBranch;
                return shiftDate >= start && shiftDate <= end && isClosed && branchFilter;
            })
        );
    };

  









    useEffect(() => {
        const fetchWebOrders = async () => {
            try {
                const res = await fetch('/api/weborder', { cache: 'no-store' });
                const data = await res.json();
                console.log(data.items);
                
                // فصل الطلبات حسب المصدر
                const webOrdersData = data.items.filter(order => order.source === 'web');
                const casherOrdersData = data.items.filter(order => !order.source || order.source === "cashier");
                
                setWebOrders(webOrdersData || []);
                setCasherOrders(casherOrdersData || []);
            } catch (error) {
                setWebOrders([]);
                setCasherOrders([]);
            } finally {
                setIsLoadingWebOrders(false);
            }
        };
        fetchWebOrders();
    }, []);

    useEffect(() => {
        if (expenses && invoices && salaries && shifts && branches) {
            filterData(startDate, endDate);
        }
    }, [startDate, endDate, filterBranch, expenses, invoices, salaries, shifts, branches]);

    if (!expenses || !invoices || !salaries || !shifts || !branches || isLoadingWebOrders) {
        return <Loading />;
    }

    const handleDateChange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };
    // هنا بجمع كل حاجة عشان احفظها عندي 
    const calculateTotal = (data, field) => {
        return data.reduce((total, item) => total + +item[field], 0);
    };
    // هنا مجموع الدخل بتاع الشيف 
    const shiftTotalIncome = () => calculateTotal(report.invoices, "total");
    // هنا مجموع مصروفات الشيف
    const shiftTotalExpenses = () => calculateTotal(report.expenses, "value");

    const shiftTotalRefund = (shift) => {
        const income = calculateTotal(shift.invoices, "total");
        const expenses = calculateTotal(shift.expenses, "value");
        return income - expenses;
    };

    const printReport = () => window.print();

    const formatDate = (date) => {
        const options = { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "numeric" };
        return new Date(date).toLocaleString("ar-EG", options);
    };

    const checkInvoice = (invoice) => {
        return filteredShifts.some(shift => shift.invoices.some(inv => inv._id === invoice._id));
    };

    const branchesName = branches.map(branch => branch.name);

    const totalIncome = () => calculateTotal(filteredShifts.flatMap(shift => shift.invoices), "total");
    const totalExpenses = () => calculateTotal(filteredShifts.flatMap(shift => shift.expenses), "value");
    const totalSalaries = () => calculateTotal(filteredSalaries, "salary");
    const totalRefunds = () => totalIncome() - (totalExpenses() + totalSalaries());
    const totalOrders = () => filteredShifts.reduce((total, shift) => total + shift.invoices.length, 0);

    // فلترة طلبات الويب الجديدة (التي لم يتم حفظها بعد)
    const filteredWebOrders = webOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const branchFilter = filterBranch === "All" || filterBranch === "" || order.branch === filterBranch;
        return orderDate >= startDate && orderDate <= endDate && branchFilter;
    });

    // فلترة طلبات الكاشير الجديدة
    const filteredCasherOrders = casherOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const branchFilter = filterBranch === "All" || filterBranch === "" || order.branch === filterBranch;
        return orderDate >= startDate && orderDate <= endDate && branchFilter;
    });

    // فصل الطلبات المحفوظة من قاعدة البيانات حسب المصدر
    const allInvoicesFromDB = filteredShifts.flatMap(shift => shift.invoices);
    
    // طلبات الكاشير: التي لا تحتوي على source أو source !== 'web'
    const cashierOrdersFromDB = allInvoicesFromDB.filter(invoice => 
        !invoice.source || invoice.source !== 'web'
    );
    
    // طلبات الموقع المحفوظة: التي تحتوي على source === 'web'
    const webOrdersFromDB = allInvoicesFromDB.filter(invoice => 
        invoice.source === 'web'
    );

    // إحصائيات الطلبات
    const totalCashierOrders = cashierOrdersFromDB.length + filteredCasherOrders.length; // طلبات الكاشير من DB + طلبات الكاشير الجديدة
    const totalWebOrdersCount = webOrdersFromDB.length + filteredWebOrders.length; // طلبات الموقع المحفوظة + طلبات الويب الجديدة

    // إحصائيات الأموال
    const totalCashierOrdersMoney = calculateTotal(cashierOrdersFromDB, "total") + calculateTotal(filteredCasherOrders, "totalPrice");
    const totalWebOrdersMoney = calculateTotal(webOrdersFromDB, "total") + calculateTotal(filteredWebOrders, "totalPrice");




    const totalCombinedIncome = totalIncome() + totalWebOrdersMoney;
    const totalWebOnlyIncome = totalWebOrdersMoney;
    const totalWebExpenses = totalExpenses() + totalSalaries();
    const totalNetProfit = totalCombinedIncome - totalWebExpenses;
    const exportedShifts = filteredShifts.map(shift => ({
        Day: formatDate(shift.createdAt),
        Close: formatDate(shift.updatedAt),
        TotalInvoices: shift.invoices.length,
        TotalExpenses: shift.expenses.length,
        Branch: shift.branch,
        TotalRefund: shiftTotalRefund(shift),
    }));

 
    return (
        <>
            <div className="filterBar">
                <DateRangePicker onDateChange={handleDateChange} />
                <div className="branch w-full mb-3 lg:mb-5">
                    {/* هنا بقوله اختار الفرع الي عايز تعمل علبه الحساب */}
                    <select className='my-2 w-full' name="branch" id="branch" value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}>
                        <option value="">اختر الفرع</option>
                        {branchesName.map((branch, ind) => (
                            <option key={ind} value={branch}>{branch}</option>
                        ))}
                        <option value="All">الكل</option>
                    </select>
                </div>
            </div>

            <div className="Info flex items-center justify-center sm:justify-start flex-wrap my-5 w-full">
                <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                    <h2 className='text-2xl font-bold'>مجموع الدخل</h2>
                    <h3 className='text-xl text-blue-300 font-bold'>{totalIncome().toLocaleString()} ج.م</h3>
                    <div className="color w-full p-2 bg-blue-500 rounded-full"></div>
                </div>







                {/* <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                    <h2 className='text-2xl font-bold'>عدد طلبات الويب</h2>
                    <h3 className='text-xl text-purple-700 font-bold'>{filteredWebOrders.length.toLocaleString()} طلب</h3>
                    <div className="color w-full p-2 bg-purple-700 rounded-full"></div>
                </div> */}
                <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                    <h2 className='text-2xl font-bold'>المصاريف</h2>
                    <h3 className='text-xl text-red-500 font-bold'>{totalExpenses().toLocaleString()} ج.م</h3>
                    <div className="color w-full p-2 bg-red-500 rounded-full"></div>
                </div>
                <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                    <h2 className='text-2xl font-bold'>مرتبات</h2>
                    <h3 className='text-xl text-pink-500 font-bold'>{totalSalaries().toLocaleString()} ج.م</h3>
                    <div className="color w-full p-2 bg-pink-500 rounded-full"></div>
                </div>
                <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
    <h2 className='text-2xl font-bold'>طلبات الكاشير</h2>
    <h3 className='text-xl text-yellow-500 font-bold'>{totalCashierOrders.toLocaleString()} طلب</h3>
    <div className="color w-full p-2 bg-yellow-500 rounded-full"></div>
</div>

<div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
    <h2 className='text-2xl font-bold'>قيمة طلبات الكاشير</h2>
    <h3 className='text-xl text-green-500 font-bold'>{totalCashierOrdersMoney.toLocaleString()} ج.م</h3>
    <div className="color w-full p-2 bg-green-500 rounded-full"></div>
</div>

<div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
    <h2 className='text-2xl font-bold'>طلبات الموقع</h2>
    <h3 className='text-xl text-purple-500 font-bold'>{totalWebOrdersCount.toLocaleString()} طلب</h3>
    <div className="color w-full p-2 bg-purple-500 rounded-full"></div>
</div>

<div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
    <h2 className='text-2xl font-bold'>قيمة طلبات الموقع</h2>
    <h3 className='text-xl text-blue-500 font-bold'>{totalWebOrdersMoney.toLocaleString()} ج.م</h3>
    <div className="color w-full p-2 bg-blue-500 rounded-full"></div>
</div>



                <div onClick={() => setShowShiftsList(!showShiftsList)} className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                    <h2 className='text-2xl font-bold'>الورديات</h2>
                    <h3 className='text-xl text-cyan-300 font-bold'>{filteredShifts.length} وردية</h3>
                    <div className="color w-full p-2 bg-cyan-500 rounded-full"></div>
                </div>
                {/* <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                                        <h2 className='text-2xl font-bold'>الدخل من الموقع فقط</h2>
                                        <h3 className='text-xl text-purple-600 font-bold'>{totalWebOnlyIncome.toLocaleString()} ج.م</h3>
                                        <div className="color w-full p-2 bg-purple-600 rounded-full"></div>
                                    </div> */}
                <div className="info w-72 h-32 flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">



                    <h2 className='text-2xl font-bold'>صافي الربح الكلي</h2>
                    <h3 className='text-xl text-green-600 font-bold'>{totalNetProfit.toLocaleString()} ج.م</h3>
                    <div className="color w-full p-2 bg-green-600 rounded-full"></div>
                </div>





            </div>
            {showShiftsList && (
                <>
                    <div className="shiftsList w-full flex flex-col items-start justify-center">
                        <h2 className='text-xl font-bold'>الورديات: </h2>
                        <div className="shifts flex flex-wrap items-center justify-center w-full">
                            {filteredShifts.map((shift, ind) => (
                                <div onClick={() => {
                                    setReport(shift)
                                    setPrintingReport(!printingReport)
                                }} key={ind} className="shift rounded-xl cursor-pointer flex items-start justify-center flex-col p-2 m-4 bg-mainColor text-bgColor">
                                    <h2 className='my-0.5'>التاريخ: {formatDate(shift.createdAt)}</h2>
                                    <h2 className='my-0.5'>الفرع: {shift.branch}</h2>
                                    <h2 className='my-0.5'>فتح الوردية: {shift.casher}</h2>
                                    <h2 className='my-0.5'>إغلاق الوردية: {shift.close}</h2>
                                    <h2 className='my-0.5'>إجمالي الوردية: {shiftTotalRefund(shift)} ج.م</h2>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
            <div className={`ReportShift absolute overflow-auto bottom-0 right-0 bg-white flex flex-col items-center justify-start p-5 ${printingReport ? "w-full h-full rounded-none opacity-100" : "opacity-0 w-0 h-0  rounded-xl"} duration-700`}>
                {printingReport && <button onClick={() => setPrintingReport(!printingReport)} className='text-red-500 bg-mainColor p-2 rounded-xl absolute top-5 left-5'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>}
                {printingReport && (
                    <>

                        <div className="summaryInvoices w-full flex flex-col items-center justify-start">
                            <div className="invoices w-full lg:w-8/12 p-2 border-2 border-mainColor flex flex-col items-start justify-start rounded-xl shadow-xl">

                                <h4 className='text-base mb-1 text-gray-500'>تاريخ الفتح: {formatDate(report.createdAt)}</h4>
                                <h4 className='text-base mb-1 text-gray-500'>بواسطة: {report.casher}</h4>
                                <h4 className='text-base mb-1 text-gray-500'>تاريخ الاغلاق: {formatDate(report.updatedAt)}</h4>
                                <h4 className='text-base mb-5 text-gray-500'>بواسطة: {report.close}</h4>

                                <div className="sammary w-full my-5">
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className='text-sm font-bold mb-2'>إجمالي الفواتير</h2>
                                        <h3 className='text-sm'>{shiftTotalIncome()} L.E</h3>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className='text-sm font-bold mb-2'>إجمالي الصرف</h2>
                                        <h3 className='text-sm'>{shiftTotalExpenses()} L.E</h3>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className='text-sm font-bold mb-2'>إجمالي الوردية</h2>
                                        <h3 className='text-sm'>{shiftTotalRefund(report)} L.E</h3>
                                    </div>
                                    <div className="flex items-center justify-between w-full">
                                        <h2 className='text-sm font-bold mb-2'>عدد الطلبات</h2>
                                        <h3 className='text-sm'>{report.invoices.length} طلب</h3>
                                    </div>

                                </div>
                                <h3 className='text-xl font-bold'>الفواتير خلال الوردية: </h3>
                                {report.invoices.map((invoice, ind) => (
                                    <div key={ind} className="invoice w-full flex flex-col items-start justify-start my-2 p-2">
                                        <h4 className='text-xs text-gray-500'>الكاشير: {invoice.user}</h4>
                                        <h4 className='text-xs text-gray-500'>العميل: {invoice.client}</h4>
                                        <h4 className='text-xs text-gray-500'>طريقة الدفع: {invoice.payment}</h4>
                                        <div className="totalInvoice flex items-center justify-between w-full">
                                            <h2 className='text-lg font-semibold mb-2'>إجمالي الفاتورة</h2>
                                            <h3 className='text-lg'>{invoice.total} L.E</h3>
                                        </div>
                                        {invoice.items.map((item, ind) => (
                                            <div className="item mb-1 w-full flex items-center justify-between" key={ind}>
                                                <h4 className='text-sm text-gray-600'><span className="font-medium">{item.title}:</span> {item.quantity} * {item.price}</h4>
                                                <h3 className='text-sm'>{item.price * item.quantity} L.E</h3>
                                            </div>
                                        ))}
                                        <div className="discount flex items-center justify-between w-full">
                                            <h2 className='text-sm font-bold mb-2'>الخصم</h2>
                                            <h3 className='text-sm'>{invoice.discount} L.E</h3>
                                        </div>
                                        <div className="delivery flex items-center justify-between w-full">
                                            <h2 className='text-sm font-bold mb-2'>التوصيل</h2>
                                            <h3 className='text-sm'>{invoice.delivery} L.E</h3>
                                        </div>

                                    </div>
                                ))}
                                {report.expenses.length > 0 && (
                                    <>
                                        <h3 className='text-xl font-bold'>المصروفات خلال الوردية: </h3>
                                        {report.expenses.map((expense, ind) => (
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
                                <button onClick={() => printReport()} className='submitBtn'>طباعة التقرير</button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className="exportData my-5">
                <button onClick={() => ExportClientsData(exportedShifts, `from ${formatDate(startDate)}`)} className='submitBtn'>تصدير الشيفتات</button>
            </div>
        </>
    )
}

