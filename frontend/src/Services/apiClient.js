const apiClient = async (url, options = {}) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  
    const res = await fetch(url, { ...options, headers, credentials: "include" });
  
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/auth";
    }
  
    return res;
  };
  
  export default apiClient;