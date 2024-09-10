import API from "../interceptor";

class CustomerSearchService {
  async getCustomerProfile(params) {
    try {
      const response = await API.post("/api/Customer/CustomerResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async updateQuickFilter(params) {
    try {
      const response = await API.put(
        "/api/Common/CustomizeQuickFilterSetting",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async addQuickFilter(params) {
    try {
      const response = await API.post(
        "/api/Common/CustomizeQuickFilterSetting",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async deleteQuickFilter(params) {
    try {
      const url = "/api/Common/CustomizeQuickFilterSetting";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.delete(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new CustomerSearchService();
