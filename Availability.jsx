import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getAvailability,
  saveAvailability,
} from "../../utils/availabilityService";

const Availability = () => {
  const [schedule, setSchedule] = useState([
    { day: "Monday", start: "", end: "" },
    { day: "Tuesday", start: "", end: "" },
    { day: "Wednesday", start: "", end: "" },
    { day: "Thursday", start: "", end: "" },
    { day: "Friday", start: "", end: "" },
    { day: "Saturday", start: "", end: "" },
    { day: "Sunday", start: "", end: "" },
  ]);

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

  const handleChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index][field] = value;
    setSchedule(updated);
  };

  const handleSubmit = () => {
    const formatted = schedule.map((day) => ({
      day: day.day,
      slots:
        day.start && day.end
          ? [{ start: day.start, end: day.end }]
          : [],
    }));

    saveAvailability({ weeklySchedule: formatted })
      .then(() => {
        toast.success("Availability saved!");
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Availability
      </h2>

      <div className="bg-white shadow-md rounded-xl p-6 max-w-2xl">
        {schedule.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between mb-4 border-b pb-3"
          >
            <p className="w-28 font-medium text-gray-700">
              {day.day}
            </p>

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