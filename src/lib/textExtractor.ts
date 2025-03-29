// Get product submissions from localStorage
export const getProductSubmissions = () => {
  const submissions = localStorage.getItem('product_submissions');
  return submissions ? JSON.parse(submissions) : [];
};
