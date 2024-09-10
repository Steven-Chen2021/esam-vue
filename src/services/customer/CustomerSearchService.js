import API from "../interceptor";

class CustomerSearchService {
  async getCustomerList(params) {
    try {
      const response = await API.post("/api/Customer/CustomerResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new CustomerSearchService();
