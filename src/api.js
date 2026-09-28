const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("scrap_mama_token");
  const response = await fetch(API_BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  requestOtp: phone => request("/auth/request-otp", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone, otp) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ phone, otp }) }),
  categories: () => request("/scrap/categories"),
  addresses: () => request("/addresses"),
  createAddress: payload => request("/addresses", { method: "POST", body: JSON.stringify(payload) }),
  pickups: () => request("/pickups"),
  createPickup: payload => request("/pickups", { method: "POST", body: JSON.stringify(payload) }),
  cancelPickup: id => request(`/pickups/${id}/cancel`, { method: "POST" }),
  adminDashboard: () => request("/admin/dashboard"),
  adminPickups: () => request("/admin/pickups"),
  adminUsers: () => request("/admin/users"),
  adminRates: () => request("/admin/rates"),
  updateRate: (id, rate) => request(`/admin/rates/${id}`, { method: "PATCH", body: JSON.stringify({ rate }) }),
  adminPayments: () => request("/admin/payments"),
  adminComplaints: () => request("/admin/complaints"),
  updateComplaint: (id, status) => request(`/admin/complaints/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
  adminRatings: () => request("/admin/ratings"),
  collectorRequests: () => request("/collector/requests"),
  collectorPickups: () => request("/collector/pickups"),
  acceptPickup: id => request(`/collector/pickups/${id}/accept`, { method: "POST" }),
  collectorStatus: (id, status) => request(`/collector/pickups/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
  weighPickup: (id, items) => request(`/collector/pickups/${id}/weigh`, { method: "POST", body: JSON.stringify({ items }) }),
  sendLocation: (id, lat, lng) => request(`/collector/pickups/${id}/location`, { method: "POST", body: JSON.stringify({ lat, lng }) }),
  pickup: id => request(`/pickups/${id}`),
  payPickup: (id, method="CASH") => request(`/pickups/${id}/payment`, { method: "POST", body: JSON.stringify({ method }) }),
  ratePickup: (id, rating, comment) => request(`/pickups/${id}/rating`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
  notifications: () => request("/notifications"),
  readNotification: id => request(`/notifications/${id}/read`, { method: "POST" })
};
