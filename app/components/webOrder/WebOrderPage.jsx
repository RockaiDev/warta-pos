'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Loading from '../main/Loading'
import socket from '@/libs/socket'

function formatDateTime(dateStr) {
  const date = new Date(dateStr)
  const dayName = date.toLocaleDateString('ar-EG', { weekday: 'long' })
  const time = date.toLocaleTimeString('ar-EG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  return `يوم ${dayName} الساعة ${time}`
}

export default function WebOrdersPage() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weborder')
      .then(res => res.json())
      .then(data => {
        setOrders(data.items || [])
        setLoading(false)
      })
      .catch(() => {
        setOrders([])
        setLoading(false)
      })

    socket.on('order-added', (newOrder) => {
      setOrders(prev => [newOrder, ...prev])
    })

    return () => {
      socket.off('order-added')
      socket.disconnect()
    }
  }, [])

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map( (order,index) => (
          <div
            key={order._id}
            className="bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-2xl transition"
            onClick={() => {
              setSelectedOrder(order)
              setShowModal(true)
            }}
          >
            <h3 className="font-bold text-lg mb-2">طلب رقم:{orders.length-(index+1)}</h3>
            <p className="text-sm text-gray-500 mb-2">{formatDateTime(order.createdAt)}</p>
            <div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center mb-2">
                  <Image
                    src={item.itemInfo.image}
                    alt={item.itemInfo.titleAr}
                    width={60}
                    height={60}
                    className="rounded-lg border"
                  />
                  <div className="ml-3">
                    <div className="font-semibold">
                      {item.itemInfo.titleAr} ({item.itemInfo.titleEn})
                    </div>
                    <div className="text-sm text-gray-500">
                      الكمية: {item.quantity} | الحجم: {item.size}
                    </div>
                    <div className="text-sm text-gray-500">
                      السعر: {item.totalPrice} ج.م
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 left-2 text-red-500 font-bold text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">تفاصيل الطلب رقم: {selectedOrder._id}</h2>
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center mb-4 border-b pb-2">
                <Image
                  src={item.itemInfo.image}
                  alt={item.itemInfo.titleAr}
                  width={80}
                  height={80}
                  className="rounded-lg border"
                />
                <div className="ml-4 flex-1">
                  <div className="font-bold text-lg">
                    {item.itemInfo.titleAr} ({item.itemInfo.titleEn})
                  </div>
                  <div className="text-sm text-gray-600 mb-1">
                    {item.itemInfo.description}
                  </div>
                  <div className="text-sm">الكمية: <strong>{item.quantity}</strong></div>
                  <div className="text-sm">الحجم: <strong>{item.size}</strong></div>
                  <div className="text-sm">السعر: <strong>{item.totalPrice} ج.م</strong></div>
                  {item.extras?.length > 0 && (
                    <div className="text-sm mt-1">
                      <strong>الإضافات:</strong>
                      <ul className="list-disc ml-4">
                        {item.extras.map((ex, i) => (
                          <li key={i}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
