import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAvailability,
  saveAvailability,
} from "../../utils/availabilityService";

const Availability = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [schedule, setSchedule] = useState([
    { day: "Monday", start: "", end: "" },
    { day: "Tuesday", start: "", end: "" },
    { day: "Wednesday", start: "", end: "" },
    { day: "Thursday", start: "", end: "" },
    { day: "Friday", start: "", end: "" },
    { day: "Saturday", start: "", end: "" },
    { day: "Sunday", start: "", end: "" },
  ]);

  // ✅ Load availability
  useEffect(() => {
    getAvailability()
      .then((data) => {
        if (data?.weeklySchedule) {
          const updated = schedule.map((d) => {
            const found = data.weeklySchedule.find(
              (item) => item.day === d.day
            );

            return {
              day: d.day,
              start: found?.slots?.[0]?.start || "",
              end: found?.slots?.[0]?.end || "",
            };
          });

          setSchedule(updated);
        }
      })
      .catch((err) => {
        console.error("Error fetching availability:", err);
      });
  }, []);

  // ✅ Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  // ✅ Validate slot (min 1 hour)
  const isValidSlot = (start, end) => {
    if (!start || !end) return false;

    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    const diffMs = endTime - startTime;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours >= 1;
  };

  // ✅ Submit availability
  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    let hasValidSlot = false;

    try {
      const formatted = schedule.map((day) => {
        if (day.start && day.end) {
          // ❌ Start >= End
          if (day.start >= day.end) {
            toast.error(`${day.day}: End time must be after start time`);
            throw new Error("Invalid time order");
          }

          // ❌ Less than 1 hour
          if (!isValidSlot(day.start, day.end)) {
            toast.error(`${day.day}: Minimum 1 hour required`);
            throw new Error("Duration too short");
          }

          hasValidSlot = true;

          return {
            day: day.day,
            date: selectedDate,
            slots: [{ start: day.start, end: day.end }],
          };
        }

        return {
          day: day.day,
          date: selectedDate,
          slots: [],
        };
      });

      if (!hasValidSlot) {
        toast.error("Please set at least one valid time slot");
        return;
      }

      saveAvailability({ weeklySchedule: formatted })
        .then(() => {
          toast.success("Availability saved successfully!");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to save availability");
        });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Availability
      </h2>

      {/* Date Picker */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl">
        {schedule.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-4 border-b pb-3"
          >
            {/* Day */}
            <p className="w-32 font-medium text-gray-700">
              {day.day}
            </p>

            {/* Time Inputs */}
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={day.start}
                onChange={(e) =>
                  handleChange(index, "start", e.target.value)
                }
                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />

              <span className="text-gray-500">to</span>

              <input
                type="time"
                value={day.end}
                onChange={(e) =>
                  handleChange(index, "end", e.target.value)
                }
                className="border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>
        ))}

        {/* Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-3 rounded-lg shadow"
          >
            Save Availability
          </button>
        </div>
      </div>
    </div>
  );
};

export default Availability;