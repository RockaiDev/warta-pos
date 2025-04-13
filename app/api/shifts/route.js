import connectMongoDB from "@/libs/mongoose"
import Shift from "@/models/shifts"
import { NextResponse } from "next/server"

export async function POST(req){
    const { status, invoices, expenses, casher, close, branch } = await req.json()
    await connectMongoDB()
    await Shift.create({ status, invoices, expenses, casher, close, branch })
    return NextResponse.json({message: "Shift Closed"}, {status: 201})
}

export async function GET(){
    await connectMongoDB()
    const shifts = await Shift.find()
    return NextResponse.json({shifts})
}

