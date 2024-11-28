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
  // async getUserAuthByCustomerResult(LID) {
  //   try {
  //     const url = `/api/Utility/GetUserAuthByCustomerResult?CustID=${LID}`;
  //     const response = await API.get(url);
  //     console.log("GetUserAuthByCustomerResult response", response);
  //     return response;
  //   } catch (error) {
  //     console.error(error);
  //     return [];
  //   }
  // }
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
  async updateContactProfile(params) {
    try {
      const response = await API.post(
        "/api/Contact/UpdateContactProfileResult",
        params
      );
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ContactProfileService();
