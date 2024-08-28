import API from "../interceptor";

class CustomerSearchService {
  async getCustomerList(params) {
    try {
      const response = await API.post("/api/Customer/CustomerResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
    // try {
    //   const url =
    //     "https://apifoxmock.com/m1/4954054-4611880-default/CustomerLeadSearch/Search";
    //   const queryString = new URLSearchParams(params).toString();
    //   const fullUrl = `${url}?${queryString}`;
    //   const response = await API.get(fullUrl);
    //   return response.returnValue;
    // } catch (error) {
    //   console.error(error);
    //   return [];
    // }
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
