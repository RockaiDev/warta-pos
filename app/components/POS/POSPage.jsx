'use client'
import React, { useEffect, useState } from 'react'
import Loading from '../main/Loading'
import { useRouter } from 'next/navigation'
import CasherPage from './CasherPage'
import { useDataContext } from '../context/DataContext'

export default function POSPage({ User }) {
  const [isLoading, setIsLoading] = useState(true)
  const [casher, setcasher] = useState(User.name)
  const [branch, setbranch] = useState(User.branch)
  const [openShift, setOpenShit] = useState('')
  const [alert, setAlert] = useState('')

  const router = useRouter()

  const { branches, shifts, items, clients } = useDataContext()
  
    if (!shifts || !branches || !items || !clients) {
      return <Loading />
    } else {

  const OpenShift = async (e) => {
    e.preventDefault()
    setAlert('جاري فتح الوردية..')
    if (branch !== 'All') {

      try {
        const res = await fetch('/api/shifts', {
          method: "POST",
          headers: {
            "Content-type": "application/json"
          },
          body: JSON.stringify({ casher, branch })
        })

        if (res.ok) {
          setAlert("اختر الوردية فور فتحها")
          location.reload()
        }

      } catch (error) {
        console.log(error);
      }
    } else {
      setAlert('اختر الفرع')
    }
  }

  const FormatedDate = (date) => {
    const CreateDate = new Date(date)
    // Format the date
    const options = { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };
    const formattedDate = CreateDate.toLocaleString('ar-EG', options);
    return formattedDate
  }


    const filteredShifts = shifts.filter(shift => {
      const OpendShifts = shift.status === 'open'
      if (User.branch !== 'All') {
        const matchedBransh = shift.branch === User.branch
        return OpendShifts && matchedBransh
      }
      return OpendShifts
    })

    if (!openShift) {
      return (
        <div className={`ChooseShift flex flex-col items-center justify-center p-2 absolute top-0 left-0 bg-bgColor duration-700 w-full opacity-100 h-full rounded-none`}>
          {User.role !== 'إدارة' && (
            <form onSubmit={OpenShift} className='flex items-center justify-center flex-col mb-5'>
              {User.branch === "All" && (
                <>
                  <select className='mb-3 w-60' name="branch" id="branch" value={branch} onChange={(e) => setbranch(e.target.value)}>
                    <option value="">اختر الفرع</option>
                    {branches.map((branch, ind) => (
                      <option value={branch.name} key={ind}>{branch.name}</option>
                    ))}
                  </select>
                </>
              )}
              <button className='submitBtn' type='submit'>{alert ? alert : 'فتح وردية'}</button>
            </form>
          )}
          <div className='flex items-center justify-center flex-col'>
            {filteredShifts.map((shift, ind) => (
              <div onClick={() => setOpenShit(shift._id)} key={ind} className="cursor-pointer w-80 hover:shadow-xl duration-700 shift flex items-start justify-center flex-col px-4 py-2 bg-blackColor text-bgColor rounded-xl my-1">
                <h3><span className='font-bold'>تم فتحها بواسطة: </span>{shift.casher}</h3>
                <h3 className='my-2'><span className='font-bold'>اسم الفرع: </span>{shift.branch}</h3>
                <p className='text-xs text-gray-400'>تاريخ الفتح: {FormatedDate(shift.createdAt)}</p>
              </div>
            ))}
            {filteredShifts.length === 0 && <h3 className='text-red-500'>لا توجد ورديات مفتوحة</h3>}
          </div>
        </div>

      )
    } else {

      return (
        <>
          <CasherPage shift={shifts.find(shift => shift._id === openShift)} items={items} User={User} clientsFromDB={clients} />
        </>
      )
    }
  }
}
