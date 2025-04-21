'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

const DataContext = createContext()
export default function DataProvider({ children }) {
    const [branches, setBranches] = useState([]) 
    const [categories, setCategories] = useState([])
    const [clients, setClients] = useState([])
    const [expenses, setExpenses] = useState([])
    const [invoices, setInvoices] = useState([])
    const [items, setItems] = useState([])
    const [salaries, setSalaries] = useState([])
    const [shifts, setShifts] = useState([])
    const [users, setUsers] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const [branches, categories, clients, expenses, invoices, items, salaries, shifts, users] = await Promise.all([
                fetch('/api/branches').then(res => res.json()),
                fetch('/api/categories').then(res => res.json()),
                fetch('/api/clients').then(res => res.json()),
                fetch('/api/expenses').then(res => res.json()),
                fetch('/api/invoices').then(res => res.json()),
                fetch('/api/items').then(res => res.json()),
                fetch('/api/salaries').then(res => res.json()),
                fetch('/api/shifts').then(res => res.json()),
                fetch('/api/users').then(res => res.json())
            ])
            setBranches(branches.branches)
            setCategories(categories.categories)
            setClients(clients.clients)
            setExpenses(expenses.expenses)
            setInvoices(invoices.invoices)
            setItems(items.items)
            setSalaries(salaries.salaries)
            setShifts(shifts.shifts)
            setUsers(users.users)
        }
        fetchData()
    }
        , [])
    
    return (
        <DataContext.Provider value={{ branches, categories, clients, expenses, invoices, items, salaries, shifts, users }}>
            {children}
        </DataContext.Provider>
    )
}

export const useDataContext = () => useContext(DataContext)