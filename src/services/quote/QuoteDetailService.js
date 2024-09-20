import API from "../interceptor";

class QuoteDetailService {
  async getQuoteDetailResult(QID) {
    try {
      const response = await API.get(`/api/Quote/QuoteDetailResult?qid=${QID}`);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteDetailService();
