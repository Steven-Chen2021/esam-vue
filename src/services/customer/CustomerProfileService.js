import API from "../interceptor";

class CustomerProfileService {
  async getPLDetailData(LID, PID) {
    try {
      console.log("getPLDetailData", `LID:${LID} PID:${PID}`);
      const url = `/api/Customer/GetPLDetailData?LID=${LID}&PID=${PID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getPLListData(LID) {
    try {
      const url = `/api/Customer/GetPLListData?LID=${LID}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getCustomerProfileColumnList(requestType) {
    try {
      const url = `/api/Customer/CustomerProfileColumnList?requestType=${requestType}`;
      const response = await API.get(url);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getCustomerProfileResult(LID) {
    try {
      const url = `/api/Customer/CustomerProfileResult?LID=${LID}`;
      const response = await API.get(url);
      console.log("getCustomerProfileResult response", response);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
  async getUserAuthByCustomerResult(LID) {
    try {
      const url = `/api/Utility/GetUserAuthByCustomerResult?CustID=${LID}`;
      const response = await API.get(url);
      console.log("GetUserAuthByCustomerResult response", response);
      return response;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
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
  async disqualifyLead(params) {
    try {
      const response = await API.post("/api/Customer/DisqualifyLead", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  // async getPLDetailData(params) {
  //   try {
  //     const url = "/api/Customer/GetPLDetailData";
  //     const queryString = new URLSearchParams(params).toString();
  //     const fullUrl = `${url}?${queryString}`;
  //     const response = await API.get(fullUrl);
  //     return response;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  async getPLUpdateHistoryListData(params) {
    try {
      const url = "/api/Customer/GetPLUpdateHistoryListData";
      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${url}?${queryString}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async ChangeProductLinesOwner(params) {
    try {
      const response = await API.post(
        "/api/Customer/ChangeProductLinesOwner",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async AddPL(params) {
    try {
      const response = await API.post("/api/Customer/AddPL", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async UpdateCustomerPLData(params) {
    try {
      const response = await API.post(
        "/api/Customer/UpdateCustomerPLData",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new CustomerProfileService();
