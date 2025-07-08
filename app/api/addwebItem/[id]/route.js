import connectMongoDB from "@/libs/mongoose";
import WebItem from "@/models/WebSiteItems";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const { id } = params;
    const data = await req.json();
    await connectMongoDB();
    const updated = await WebItem.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "WebItem Updated", item: updated });
}

export async function DELETE(req, { params }) {
    const { id } = params;
    await connectMongoDB();
    const deleted = await WebItem.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "WebItem Deleted" });
} 