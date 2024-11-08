import API from "../interceptor";

class ContactSearchService {
  async getContactList(params) {
    try {
      const response = await API.post("/api/Contact/ContactResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new ContactSearchService();
