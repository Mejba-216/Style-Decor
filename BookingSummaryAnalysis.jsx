import React, { useState } from "react";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


const BookingSummaryAnalysis = () => {
  const axiosSecure = useAxiosSecure();


  // ✅ TIME FILTER STATE
  const [timeFilter, setTimeFilter] = useState("all");


  // ✅ FETCH BOOKINGS
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings");
      return res.data;
    },
  });


  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }


  // ✅ TIME FILTER LOGIC
  const filteredBookings = bookings.filter((booking) => {
    if (timeFilter === "all") return true;


    if (!booking.eventDate) return false;


    const bookingDate = new Date(booking.eventDate);
    const today = new Date();


    if (timeFilter === "today") {
      return bookingDate.toDateString() === today.toDateString();
    }


    if (timeFilter === "7days") {
      const past = new Date();
      past.setDate(today.getDate() - 7);
      return bookingDate >= past;
    }


    if (timeFilter === "30days") {
      const past = new Date();
      past.setDate(today.getDate() - 30);
      return bookingDate >= past;
    }


    return true;
  });


  const totalBookings = filteredBookings.length;


  const totalRevenue = filteredBookings
    .filter((b) => b.paymentStatus === "paid")
    .reduce((sum, b) => sum + (b.cost || 0), 0);


  const pendingPayments = filteredBookings
    .filter((b) => b.paymentStatus !== "paid")
    .reduce((sum, b) => sum + (b.cost || 0), 0);


  const confirmedBookings = filteredBookings.filter(
    (b) => b.BookingStatus === "confirmed"
  ).length;
   const avgBookingValue =
    totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
 
  const revenueMap = {};
    filteredBookings.forEach((b) => {
    if (b.paymentStatus === "paid") {
      const title = b.serviceTitle || "Unknown";
      revenueMap[title] = (revenueMap[title] || 0) + (b.cost || 0);
    }
  });
   const serviceCountMap = {};
  filteredBookings.forEach((booking) => {
    const title = booking.serviceTitle || "Unknown";
    serviceCountMap[title] = (serviceCountMap[title] || 0) + 1;
  });


  const serviceDemandData = Object.keys(serviceCountMap)
    .map((title) => ({
      service: title,
      bookings: serviceCountMap[title],
    }))
    .sort((a, b) => b.bookings - a.bookings);


   
  const topService =
    serviceDemandData.length > 0 ? serviceDemandData[0].service : "N/A";




  const topRevenueService =
    Object.keys(revenueMap).length > 0
    ? Object.entries(revenueMap).sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";


  const paidBookings = filteredBookings.filter(
    (b) => b.paymentStatus === "paid"
  ).length;


  const conversionRate =
   totalBookings > 0
    ? ((paidBookings / totalBookings) * 100).toFixed(1)
    : 0;
  return (


    <div className="p-8 bg-gray-100 min-h-screen">
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-8 text-[#062416] text-center">
        Booking Summary Analysis
      </h1>


      {/* ✅ TIME FILTER UI */}
      <div className="flex justify-end mb-6">
        <select
          className="select select-bordered"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
        </select>
      </div>


      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Total Bookings
          </h3>
          <p className="text-3xl font-bold text-blue-600 mt-4">
            {totalBookings}
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Total Revenue (Paid)
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-4">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Pending Payments
          </h3>
          <p className="text-3xl font-bold text-orange-600 mt-4">
            ${pendingPayments.toLocaleString()}
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Confirmed Bookings
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-4">
            {confirmedBookings}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
        <div className="bg-gray-50 p-5 rounded-lg text-center">
          <p className="text-sm text-gray-500">Top Service</p>
          <h3 className="text-lg font-bold text-blue-600">{topService}</h3>
        </div>


        <div className="bg-gray-50 p-5 rounded-lg text-center">
          <p className="text-sm text-gray-500">Top Revenue Service</p>
          <h3 className="text-lg font-bold text-green-600">{topRevenueService}</h3>
        </div>


        <div className="bg-gray-50 p-5 rounded-lg text-center">
          <p className="text-sm text-gray-500">Avg Booking Value</p>
          <h3 className="text-lg font-bold text-purple-600">${avgBookingValue}</h3>
        </div>


        <div className="bg-gray-50 p-5 rounded-lg text-center">
           <p className="text-sm text-gray-500">Conversion Rate</p>
           <h3 className="text-lg font-bold text-orange-600">{conversionRate}%</h3>
        </div>
      </div>


      {/* CHART */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-[#062416] text-center">
          Service Demand Chart
        </h2>


        <p className="text-center text-gray-600 mb-8">
          Number of bookings per service
        </p>


        {serviceDemandData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={serviceDemandData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="service"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500">
            No booking data available for this filter.
          </p>
        )}
      </div>
    </div>
  );
};


export default BookingSummaryAnalysis;