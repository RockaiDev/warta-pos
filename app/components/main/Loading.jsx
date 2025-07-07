import Image from 'next/image'
import React from 'react'

export default function Loading() {
  return (
      <>
          <div className="loading absolute top-0 left-0 w-full h-full flex items-center justify-center bg-[#231f20]">
              <Image src={'/loading.gif'} width={300} height={300} alt='Loading Warta POS' />
          </div>
      </>
  )
}
