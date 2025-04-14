import React, { useState } from 'react'

export default function AddSalary({ branches, users, User }) {
    const [payFor, setPayFor] = useState("")
    const [salary, setSalary] = useState(0)
    const [branch, setbranch] = useState("")
    const [alert, setAlert] = useState("")
    let user = User.name

    const AddSalary = async (e) => {
        e.preventDefault()
        setAlert('يتم مراجعة البيانات..')
        if (payFor && salary && branch && user) {
            try {
                const res = await fetch('/api/salaries', {
                    method: "POST",
                    headers: {
                        "Content-type": 'application/json'
                    },
                    body: JSON.stringify({ payFor, salary, branch, user })
                })

                if (res.ok) {
                    setAlert('تم إضافة المرتب بنجاح')
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setAlert('جميع البيانات مطلوبة')
        }
    }

    let branchesName = []
    branches.map(branch => {
        branchesName.push(branch.name)
    })

    return (
        <form onSubmit={AddSalary}>
            <div className="payFor w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="payFor">اسم الموظف:</label>
                <select className='w-full my-2' name="payFor" id="payFor" value={payFor} onChange={(e) => setPayFor(e.target.value)}>
                    {users.map((user, ind) => (
                        <option value={user.name} key={ind}>{user.name}</option>
                    ))}
                </select>
            </div>
            <div className="salary w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="salary">قيمة المرتب:</label>
                <input className='w-full my-2' type="number" name="salary" value={salary} onChange={(e) => setSalary(e.target.value)} id="title" placeholder='القيمة' />
            </div>
            <div className="description w-full mb-3 lg:mb-5">
                <label className='text-xl font-semibold' htmlFor="branch">الفرع :</label>
                <select className='my-2 w-full' name="branch" id="branch" value={branch} onChange={(e) => setbranch(e.target.value)}>
                    <option value="">اختر الفرع</option>
                    {branchesName.map((branch, ind) => (
                        <option key={ind} value={branch}>{branch}</option>
                    ))}
                    <option value="All">الكل</option>
                </select>
            </div>

            <button className='submitBtn w-full'>{alert ? alert : "إضافة الصرف"}</button>
        </form>
    )
}
