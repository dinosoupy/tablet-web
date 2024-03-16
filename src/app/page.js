'use client'
import Ribbon from '@/components/Ribbon/Ribbon'
import AlertBar from '@/components/AlertBar/AlertBar'
import Canvas from '@/components/Canvas/Canvas'
import Slideover from '@/components/Slideover'
import { useState } from 'react'

export default function Home() {
  const [open, setOpen] = useState(false)

  return (
    <main className="">
      <Ribbon />
      <AlertBar open={open} setOpen={setOpen} />
      <div className='flex-1 relative'>
        <Slideover open={open} setOpen={setOpen} />
        <Canvas />
      </div>
    </main>
  )
}
// flex flex-col
// 