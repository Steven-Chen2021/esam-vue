import API from "../interceptor";

class ContactProfileService {
  async getContactProfileResult(ContactID) {
    try {
      const url = `/api/Contact/ContactProfileResult?ContactID=${ContactID}`;
      const response = await API.get(url);
      console.log("getContactProfileResult response", response);
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
  async inactiveContactResult(contactID) {
    try {
      const response = await API.post(
        `/api/Contact/InactiveContactResult?ContactID=${contactID}`
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async activeContactResult(contactID) {
    try {
      const response = await API.post(
        `/api/Contact/ActiveContactResult?ContactID=${contactID}`
      );
      return response;
    } catch (error) {
      console.error(error);
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

export default new ContactProfileService();
