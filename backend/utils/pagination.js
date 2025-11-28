const getPagination = (page, limit) => {
  const offset = (page - 1) * limit;
  return { offset, limit: parseInt(limit) };
};

const getPagingData = (data, page, limit) => {
  const { count: total } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(total / limit);
  
  return { total, data: data.rows, totalPages, currentPage };
};

export default {
  getPagination,
  getPagingData
}; 