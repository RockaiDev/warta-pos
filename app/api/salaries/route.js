import connectMongoDB from "@/libs/mongoose"
import Salary from "@/models/salary"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { payFor, user, salary, branch } = await req.json()
    await connectMongoDB()
    await Salary.create({ payFor, user, salary, branch })
    return NextResponse.json({message: "Salary Paied"} , { status: 201})
}

export async function GET(){
    await connectMongoDB()
    const salaries = await Salary.find()
    return NextResponse.json({salaries})
}

export async function DELETE(req) {
    const id = req.nextUrl.searchParams.get("id")
    await connectMongoDB()
    await Salary.findByIdAndDelete(id)
    return NextResponse.json({ message: "Salary Deleted" }, { status: 200 })
}