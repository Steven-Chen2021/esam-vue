import API from "../interceptor";

class QuoteDetailService {
  async getQuoteDetailResult(params) {
    try {
      const response = await API.get("/api/Quote/QuoteDetailResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteDetailService();
