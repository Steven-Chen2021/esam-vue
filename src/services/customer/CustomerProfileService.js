import API from "../interceptor";

class CustomerProfileService {
  async updateCustomerProfile(params) {
    try {
      const response = await API.post(
        "/api/Customer/UpdateCustomerProfile",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getPLDetailData(params) {
    try {
      const url = "/api/Customer/GetPLDetailData";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.get(fullUrl);
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

export default new CustomerProfileService();
