import API from "../interceptor";

class QuoteSearchService {
  async getQuoteList(params) {
    try {
      const response = await API.post("/api/Quote/QuoteResult", params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteSearchService();
