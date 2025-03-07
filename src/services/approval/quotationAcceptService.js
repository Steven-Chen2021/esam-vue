import API from "../interceptor";

class quotationAcceptService {
  async sendCustomerAcceptQuotation(params) {
    try {
      const response = await API.post("/api/Quote/QuoteAcceptResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new quotationAcceptService();
