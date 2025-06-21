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
        console.log(data.items);
        
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

  // دالة لمعالجة عرض العناصر حسب نوع الطلب
  const renderOrderItems = (order) => {
    if (order.source === 'web') {
      // طلبات الويب
      return order.items.map((item, idx) => (
        <div key={idx} className="flex items-center mb-2">
          <Image
            src={item.itemInfo?.image || "/burger.png"}
            alt={item.itemInfo?.titleAr || "صورة المنتج"}
            width={60}
            height={60}
            className="rounded-lg border"
          />
          <div className="ml-3">
            <div className="font-semibold">
              {item.itemInfo?.titleAr || "غير محدد"} ({item.itemInfo?.titleEn || "غير محدد"})
            </div>
            <div className="text-sm text-gray-500">
              الكمية: {item.quantity} | الحجم: {item.size || "عادي"}
            </div>
            <div className="text-sm text-gray-500">
              السعر: {item.totalPrice || 0} ج.م
            </div>
          </div>
        </div>
      ))
    } else {
      // طلبات الكاشير
      return order.items.map((item, idx) => (
        <div key={idx} className="flex items-center mb-2 gap-4">
          <Image
            src="/burger.png"
            alt="صورة المنتج"
            width={60}
            height={60}
            className="rounded-lg border"
          />
          <div className="ml-3">
            <div className="font-semibold">
              {item.title || "غير محدد"}
            </div>
            <div className="text-sm text-gray-500">
              الكمية: {item.quantity} | الفئة: {item.category}
            </div>
            <div className="text-sm text-gray-500">
              السعر: {item.price || 0} ج.م
            </div>
            {item.isSpicy && <div className="text-sm text-red-500">🌶️ حار</div>}
            {item.without && <div className="text-sm text-gray-400">بدون: {item.without}</div>}
          </div>
        </div>
      ))
    }
  }

  // دالة لمعالجة عرض تفاصيل الطلب في المودال
  const renderOrderDetails = (order) => {
    if (order.source === 'web') {
      // تفاصيل طلبات الويب
      return order.items.map((item, idx) => (
        <div key={idx} className="flex items-center mb-4 border-b pb-2">
          <Image
            src={item.itemInfo?.image || "/burger.png"}
            alt={item.itemInfo?.titleAr || "صورة المنتج"}
            width={80}
            height={80}
            className="rounded-lg border"
          />
          <div className="ml-4 flex-1">
            <div className="font-bold text-lg">
              {item.itemInfo?.titleAr || "غير محدد"} ({item.itemInfo?.titleEn || "غير محدد"})
            </div>
            <div className="text-sm text-gray-600 mb-1">
              {item.itemInfo?.description || "لا يوجد وصف"}
            </div>
            <div className="text-sm">الكمية: <strong>{item.quantity}</strong></div>
            <div className="text-sm">الحجم: <strong>{item.size || "عادي"}</strong></div>
            <div className="text-sm">السعر: <strong>{item.totalPrice || 0} ج.م</strong></div>
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
      ))
    } else {
      // تفاصيل طلبات الكاشير
      return order.items.map((item, idx) => (
        <div key={idx} className="flex items-center mb-4 border-b pb-2">
          <Image
            src="/burger.png"
            alt="صورة المنتج"
            width={80}
            height={80}
            className="rounded-lg border"
          />
          <div className="ml-4 flex-1">
            <div className="font-bold text-lg">
              {item.title || "غير محدد"}
            </div>
            <div className="text-sm text-gray-600 mb-1">
              الفئة: {item.category || "غير محدد"}
            </div>
            <div className="text-sm">الكمية: <strong>{item.quantity}</strong></div>
            <div className="text-sm">السعر: <strong>{item.price || 0} ج.م</strong></div>
            {item.isSpicy && <div className="text-sm text-red-500">🌶️ حار</div>}
            {item.without && <div className="text-sm text-gray-400">بدون: {item.without}</div>}
          </div>
        </div>
      ))
    }
  }

  if (loading) return <Loading />

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order, index) => (
          <div
            key={order._id}
            className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer hover:shadow-2xl transition ${
              order.source === 'web' ? 'border-l-4 border-blue-500' : 'border-l-4 border-green-500'
            }`}
            onClick={() => {
              setSelectedOrder(order)
              setShowModal(true)
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg">طلب رقم: {orders.length - index}</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                order.source === 'web' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {order.source === 'web' ? 'ويب' : 'كاشير'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{formatDateTime(order.createdAt)}</p>
            <div className="mb-2">
              <p className="text-sm"><strong>العميل:</strong> {order.name || "غير محدد"}</p>
              <p className="text-sm"><strong>الهاتف:</strong> {order.phoneNum || "غير محدد"}</p>
              <p className="text-sm"><strong>العنوان:</strong> {order.address || "غير محدد"}</p>
              <p className="text-sm"><strong>المجموع:</strong> {order.totalPrice || 0} ج.م</p>
            </div>
            <div>
              {renderOrderItems(order)}
            </div>
          </div>
        ))}
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 left-2 text-red-500 font-bold text-xl"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">تفاصيل الطلب رقم: {selectedOrder._id}</h2>
              <span className={`px-3 py-1 rounded text-sm font-bold ${
                selectedOrder.source === 'web' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {selectedOrder.source === 'web' ? 'طلب ويب' : 'طلب كاشير'}
              </span>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <p><strong>اسم العميل:</strong> {selectedOrder.name || "غير محدد"}</p>
              <p><strong>رقم الهاتف:</strong> {selectedOrder.phoneNum || "غير محدد"}</p>
              <p><strong>العنوان:</strong> {selectedOrder.address || "غير محدد"}</p>
              <p><strong>المجموع الإجمالي:</strong> {selectedOrder.totalPrice || 0} ج.م</p>
              <p><strong>تاريخ الطلب:</strong> {formatDateTime(selectedOrder.createdAt)}</p>
            </div>
            
            {renderOrderDetails(selectedOrder)}
          </div>
        </div>
      )}
    </div>
  )
}
