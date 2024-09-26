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

  async getCustomerByOwnerUserData() {
    try {
      const url = "/api/Quote/CustomerByOwnerUserResult";
      const fullUrl = `${url}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async ChargeCodeSettingResult(ChargeCodeType) {
    try {
      const url = "/api/Quote/ChargeCodeSettingResult";
      const fullUrl = `${url}?ChargeCodeType=${ChargeCodeType}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteDetailService();
