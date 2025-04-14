'use client'
import React, { useEffect, useState } from 'react'
import DateRangePicker from './DateRangePicker';
import Loading from '../main/Loading'
import * as XLSX from 'xlsx'


export default function DashboardPage({ User }) {
    const [expenses, setExpenses] = useState(null)
    const [filteredexpenses, setFilteredexpenses] = useState([])
    const [invoices, setInvoices] = useState(null)
    const [filteredinvoices, setFilteredinvoices] = useState([])
    const [salaries, setSalaries] = useState(null)
    const [filteredsalaries, setFilteredsalaries] = useState([])
    const [shifts, setShifts] = useState(null)
    const [filteredshifts, setFilteredshifts] = useState([])
    const [branches, setBranches] = useState(null)

    const [isLoading, setIsLoading] = useState(true)
    const [filterBranch, setFilterBranch] = useState("")

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [startDate, setStartDate] = useState(startOfDay);
    const [endDate, setEndDate] = useState(now);

    const GetData = async () => {
        try {
            const resexpenses = await fetch(`/api/expenses`, {
                cache: 'no-store'
            })

            const expensesResult = await resexpenses.json()
            setExpenses(expensesResult.expenses)

            const resinvoices = await fetch(`/api/invoices`, {
                cache: 'no-store'
            })

            const invoicesResult = await resinvoices.json()
            setInvoices(invoicesResult.invoices)

            const ressalaries = await fetch(`/api/salaries`, {
                cache: 'no-store'
            })

            const salariesResult = await ressalaries.json()
            setSalaries(salariesResult.salaries)

            const resbranches = await fetch(`/api/branches`, {
                cache: 'no-store'
            })

            const branchesResult = await resbranches.json()
            setBranches(branchesResult.branches)

            const resshifts = await fetch(`/api/shifts`, {
                cache: 'no-store'
            })

            const shiftsResult = await resshifts.json()
            setShifts(shiftsResult.shifts)

            if (resshifts.ok && resexpenses.ok && resinvoices.ok && ressalaries.ok && resbranches.ok) {
                if (startDate && endDate) {
                    filterData(startDate, endDate);
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        GetData()


        const refresh = setInterval(GetData, 2000)
        return () => clearInterval(refresh)
    }, [startDate, endDate, filterBranch]);




    const filterData = (start, end) => {
        const filteredExp = expenses.filter(expense => {
            const expDate = new Date(expense.createdAt);
            if (filterBranch !== "All") {
                const branchFilter = expense.branch === filterBranch
                return expDate >= start && expDate <= end && branchFilter;
            } else {
                return expDate >= start && expDate <= end;
            }
        });

        const filteredInv = invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.createdAt);
            if (filterBranch !== "All") {
                const branchFilter = invoice.branch === filterBranch
                return invoiceDate >= start && invoiceDate <= end && branchFilter;
            } else {
                return invoiceDate >= start && invoiceDate <= end;
            }
        });

        const filteredSly = salaries.filter(salary => {
            const salaryDate = new Date(salary.createdAt);
            if (filterBranch !== "All") {
                const branchFilter = salary.branch === filterBranch
                return salaryDate >= start && salaryDate <= end && branchFilter;
            } else {
                return salaryDate >= start && salaryDate <= end;
            }
        });

        const filteredShft = shifts.filter(shift => {
            const shiftDate = new Date(shift.createdAt);
            const closed = shift.status === 'close'
            if (filterBranch !== "All") {
                const branchFilter = shift.branch === filterBranch
                return shiftDate >= start && shiftDate <= end && closed && branchFilter;
            } else {
                return shiftDate >= start && shiftDate <= end && closed;
            }
        });

        setFilteredexpenses(filteredExp)
        setFilteredinvoices(filteredInv)
        setFilteredsalaries(filteredSly)
        setFilteredshifts(filteredShft)
    };

    const handleDateChange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
    };

    // Handle Shifts *********************
    const [showShiftsList, setShowShiftsList] = useState(false)
    const [report, setreport] = useState(null)
    const [printingReport, setPrintingReport] = useState(false)

    const shiftTotalIncome = () => {
        let shiftIncome = 0
        report.invoices.map((invoice) => {
            shiftIncome = shiftIncome + invoice.total
        })

        return shiftIncome
    }

    const shiftTotalExpenses = () => {
        let shiftExpenses = 0
        report.expenses.map((expense) => {
            shiftExpenses = shiftExpenses + expense.value
        })

        return shiftExpenses
    }

    const shiftTotalRefund = (shift) => {
        let shiftIncome = 0
        shift.invoices.map((invoice) => {
            shiftIncome = shiftIncome + invoice.total
        })

        let shiftExpenses = 0
        shift.expenses.map((expense) => {
            shiftExpenses = shiftExpenses + expense.value
        })

        let ShiftTotal = shiftIncome - shiftExpenses

        return ShiftTotal

    }

    const PrintReport = () => {
        window.print()
    }

    // Handle Shifts *********************


    const FormatedDate = (date) => {
        const CreateDate = new Date(date)
        // Format the date
        const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
        const formattedDate = CreateDate.toLocaleString('ar-EG', options);
        return formattedDate
    }


    if (isLoading) {
        return <Loading />
    } else {

        let branchesName = []
        branches.map(branch => {
            branchesName.push(branch.name)
        })

        const TotalIncome = () => {
            let totalIncome = 0
            filteredshifts.map(shift => {
                shift.invoices.map(inv => {
                    totalIncome = totalIncome + +inv.total
                })
            })
            return totalIncome
        }

        const TotalExp = () => {
            let totalExp = 0
            filteredshifts.map(shift => {
                shift.expenses.map(exp => {
                    totalExp = totalExp + +exp.value
                })
            })
            return totalExp
        }

        const TotalSly = () => {
            let totalSly = 0
            filteredsalaries.map(salary => {
                totalSly = totalSly + +salary.salary
            })
            return totalSly
        }

        const TotalRefunds = () => {
            let totalRefund = TotalIncome() - (TotalExp() + TotalSly())
            return totalRefund
        }


        const TotalOrders = () => {
            let orders = 0
            filteredshifts.map(shift => {
                orders = orders + shift.invoices.length
            })

            return orders
        }

        // export As Excel Sheet
        const exportedShifts = []
        filteredshifts.map((shift, ind) => {
            const FormatedSheft = {
                Day: FormatedDate(shift.createdAt),
                close: FormatedDate(shift.updatedAt),
                totalInvoices: shift.invoices.length,
                totalExpenses: shift.expenses.length,
                branch: shift.branch,
                totalRefund: shiftTotalRefund(shift),
            }
            exportedShifts.push(FormatedSheft)
        })

        const ExportClientsData = (data, worksheetName) => {
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
            XLSX.writeFile(wb, `${worksheetName}-Shifts.xlsx`);
        }

        return (
            <>
                <div className="filterBar">
                    <DateRangePicker onDateChange={handleDateChange} />
                    <div className="branch w-full mb-3 lg:mb-5">
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
                    <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>مجموع الدخل</h2>
                        <h3 className='text-xl text-blue-300 font-bold'>{TotalIncome()} ج.م</h3>
                        <div className="color w-full p-2 bg-blue-500 rounded-full">
                        </div>
                    </div>
                    <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>المصاريف</h2>
                        <h3 className='text-xl text-red-500 font-bold'>{TotalExp()} ج.م</h3>
                        <div className="color w-full p-2 bg-red-500 rounded-full">
                        </div>
                    </div>
                    <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>مرتبات</h2>
                        <h3 className='text-xl text-pink-500 font-bold'>{TotalSly()} ج.م</h3>
                        <div className="color w-full p-2 bg-pink-500 rounded-full">
                        </div>
                    </div>
                    <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>إجمالي العائدات</h2>
                        <h3 className='text-xl text-green-500 font-bold'>{TotalRefunds()} ج.م</h3>
                        <div className="color w-full p-2 bg-green-500 rounded-full">
                        </div>
                    </div>
                    <div className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>الطلبات</h2>
                        <h3 className='text-xl text-yellow-500 font-bold'>{TotalOrders()} طلب</h3>
                        <div className="color w-full p-2 bg-yellow-500 rounded-full">
                        </div>
                    </div>
                    <div onClick={() => setShowShiftsList(!showShiftsList)} className="info w-72 h-32 cursor-pointer flex flex-col m-2 items-start justify-between p-4 shadow-xl rounded-xl border bg-mainColor text-bgColor">
                        <h2 className='text-2xl font-bold'>الورديات</h2>
                        <h3 className='text-xl text-cyan-300 font-bold'>{filteredshifts.length} وردية</h3>
                        <div className="color w-full p-2 bg-cyan-500 rounded-full">
                        </div>
                    </div>
                </div>
                {showShiftsList && (
                    <>
                        <div className="shiftsList w-full flex flex-col items-start justify-center">
                            <h2 className='text-xl font-bold'>الورديات: </h2>
                            <div className="shifts flex flex-wrap items-center justify-center w-full">
                                {filteredshifts.map((shift, ind) => (
                                    <div onClick={() => {
                                        setreport(shift)
                                        setPrintingReport(!printingReport)
                                    }} key={ind} className="shift rounded-xl cursor-pointer flex items-start justify-center flex-col p-2 m-4 bg-mainColor text-bgColor">
                                        <h2 className='my-0.5'>التاريخ: {FormatedDate(shift.createdAt)}</h2>
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
                                <div className="invoices w-full lg:w-8/12 p-2 border-2 border-mainColor">

                                    <h4 className='text-base mb-1 text-gray-500'>تاريخ الفتح: {FormatedDate(report.createdAt)}</h4>
                                    <h4 className='text-base mb-1 text-gray-500'>بواسطة: {report.casher}</h4>
                                    <h4 className='text-base mb-1 text-gray-500'>تاريخ الاغلاق: {FormatedDate(report.updatedAt)}</h4>
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
                                    <button onClick={() => PrintReport()} className='submitBtn'>طباعة التقرير</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="exportData my-5">
                    <button onClick={() => ExportClientsData(exportedShifts, `from ${FormatedDate(startDate)}`)} className='submitBtn'>تصدير الشيفتات</button>
                </div>
            </>
        )
    }
}
