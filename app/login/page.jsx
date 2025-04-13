'use client'
import Image from 'next/image'
import BgImageLogin from '../../public/loginbgPhone.svg'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '../components/main/Loading'

export default function Page() {
  const [users, setUsers] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alert, setAlert] = useState('')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  useEffect(() => {
    const getUsers = async () => {
      try {
        const res = await fetch('/api/users')
        const users = await res.json()
        setUsers(users.users)

      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false)
      }
    }

    getUsers()
  }, [])


  if (users === null || isLoading) {
    return <Loading />
  } else {

    const user = users.filter(user => {
      const usernameMatched = user.username === username
      return usernameMatched
    })

    const signIn = (e) => {
      e.preventDefault()
      if (username && password) {

        if (user[0]?.username === username) {
          if (user[0].password == password) {

            sessionStorage.setItem('User', JSON.stringify(user[0]))
            setAlert('تم تسجيل الدخول');
            router.push('/')
          } else {
            setAlert('كلمة المرور غلط')
          }
        } else {
          setAlert("هذا المستخدم غير موجود");
        }
      } else {
        setAlert('اكتب اسم المستخدم و  كلمة السر')
      }
    }

    return (
      <section className='w-full h-full flex items-center justify-center p-5' style={{
        backgroundImage: `url(${BgImageLogin.src})`,
        backgroundSize: 'cover',
        backgroundPosition: "Center",
      }}>
        <div className="loginForm w-full lg:w-8/12 bg-bgColor p-5 rounded-2xl shadow-2xl border">
          <div className="head flex items-center justify-between mb-5 lg:mb-10">
            <h2 className='text-base lg:text-2xl'>تسجيل دخول للمسخدمين المسجلين فقط</h2>
            <Image src={'/wartalogo.png'} width={100} height={100} alt='WartLogo' />
          </div>
          <form onSubmit={signIn} onChange={() => setAlert('تسجيل الدخول')}>
            <div className="username w-full mb-3 lg:mb-5">
              <label className='text-xl font-semibold' htmlFor="username">اسم المستخدم:</label>
              <input className='w-full my-2' type="text" name="username" value={username} onChange={(e) => setUsername(e.target.value)} id="username" placeholder='اسم المستخدم' />
            </div>
            <div className="password w-full mb-3 lg:mb-5">
              <label className='text-xl font-semibold' htmlFor="password">كلمة المرور:</label>
              <input className='w-full my-2' type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} id="password" placeholder='اسم المستخدم' />
            </div>
            <button className='submitBtn' type='submit'>{alert ? alert : 'تسجيل دخول'}</button>
          </form>
        </div>
      </section>
    )
  }
}
