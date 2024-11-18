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
  async copyQuotation(params) {
    try {
      const url = "/api/Quote/QuoteCopyResult";
      const response = await API.post(url, params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteSearchService();
