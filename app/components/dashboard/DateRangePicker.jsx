'use client'
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ onDateChange }) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [startDate, setStartDate] = useState(startOfDay);
    const [endDate, setEndDate] = useState(now);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        onDateChange(date, endDate);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        onDateChange(startDate, date);
    };

    return (
        <div className='flex items-center justify-center'>
            <DatePicker
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className='mx-2 w-40'
                />
            <DatePicker
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                placeholderText="End Date"
                className='mx-2 w-40'
                />
        </div>
    );
};

export default DateRangePicker;
