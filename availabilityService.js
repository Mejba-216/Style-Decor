import api from "./api";

// GET availability
export const getAvailability = async () => {
  const res = await api.get("/availability");
  return res.data;
};

// SAVE availability
export const saveAvailability = async (data) => {
  const res = await api.put("/availability", data);
  return res.data;
};