import React, { useState } from "react";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import useAuth from "../../hooks/useAuth";
import Swal from "sweetalert2";

const days = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const SetAvailability = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const [availability, setAvailability] = useState({});

  const handleChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      await axiosSecure.patch("/decorators/availability", availability);

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Availability updated successfully",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update availability",
      });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Set Availability</h2>

      {days.map((day) => (
        <div key={day} className="flex items-center gap-4 mb-4">
          <label className="w-28 capitalize">{day}</label>

          <input
            type="time"
            className="input input-bordered"
            onChange={(e) => handleChange(day, "start", e.target.value)}
          />

          <input
            type="time"
            className="input input-bordered"
            onChange={(e) => handleChange(day, "end", e.target.value)}
          />
        </div>
      ))}

      <button onClick={handleSubmit} className="btn btn-primary mt-4">
        Save Availability
      </button>
    </div>
  );
};

export default SetAvailability;