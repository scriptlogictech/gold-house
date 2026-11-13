import api from "./api";

export const getPublicProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getPublicProductBySlug = async (slug) => {
  const response = await api.get(`/products/${encodeURIComponent(slug)}`);
  return response.data;
};
