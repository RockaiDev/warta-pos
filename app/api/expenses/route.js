import connectMongoDB from "@/libs/mongoose"
import Expense from "@/models/expenses"
import { NextResponse } from "next/server"

export async function POST(req){
    const { reason, value, description, user, branch } = await req.json()
    await connectMongoDB()
    await Expense.create({ reason, value, description, user, branch })
    return NextResponse.json({message: "Expense Done"} , { status: 201})
}

export async function GET(){
    await connectMongoDB()
    const expenses = await Expense.find() 
    return NextResponse.json({expenses})
}

export async function DELETE(req) {
    const id = req.nextUrl.searchParams.get("id")
    await connectMongoDB()
    await Expense.findByIdAndDelete(id)
    return NextResponse.json({message: "Expense Deleted"} , {status: 200})
}
