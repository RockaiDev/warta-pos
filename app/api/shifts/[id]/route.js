import connectMongoDB from "@/libs/mongoose"
import Shift from "@/models/shifts"
import { NextResponse } from "next/server"

export async function PUT(req, { params }) {
    const { id } = params
    const { status, invoices, expenses, close } = await req.json()
    await connectMongoDB()
    await Shift.findByIdAndUpdate(id, { status, invoices, expenses, close })
    return NextResponse.json({message:"Shift Updated"} , {status: 200})
}

export async function DELETE(req, {params}){
    const { id } = params
    await connectMongoDB()
    await Shift.findByIdAndDelete(id)
    return NextResponse.json({ message: "Shift Deleted" }, { status: 200 })
}

