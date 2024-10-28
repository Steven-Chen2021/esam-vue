import API from "../interceptor";

class QuoteDetailService {
  async getQuoteDetailResult(QID) {
    try {
      const response = await API.get(
        `/api/Quote/QuoteDetailResult?QuoteID=${QID}`
      );
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

  async ChargeCodeSettingResult_Old(ChargeCodeType) {
    try {
      const url = "/api/Quote/ChargeCodeSettingResult";
      const fullUrl = `${url}?ChargeCodeType=${ChargeCodeType}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async ChargeCodeSettingResult(QuoteID, PID) {
    try {
      const url = "/api/Quote/QuoteFreightColumnSettingResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getProductLineByCustomerData(CustomerHQID) {
    try {
      const url = "/api/Quote/ProductLineByCustomerResult";
      const fullUrl = `${url}?CustomerHQID=${CustomerHQID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getShippingTerm() {
    try {
      const url = "/api/Quote/ShippingTermResult";
      const fullUrl = `${url}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getAttentionTo(CustomerHQID) {
    try {
      const url = "/api/Quote/AttentionToResult";
      const fullUrl = `${url}?CustomerHQID=${CustomerHQID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getTradeTerm(ShippingTerm) {
    try {
      const url = "/api/Quote/TradeTermResult";
      const fullUrl = `${url}?ShippingTerm=${ShippingTerm}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getQuoteType(CodeClass, CodeContents, CodeCondition) {
    try {
      const url = "/api/Quote/QuoteTypeResult";
      const fullUrl = `${url}?CodeClass=${CodeClass}&CodeContents=${CodeContents}&CodeCondition=${CodeCondition}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getCreditTerm(HQID, PID) {
    try {
      const url = "/api/Quote/CreditTermResult";
      const fullUrl = `${url}?HQID=${HQID}&PID=${PID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getQuoteFreightCharge(QuoteID, PID) {
    try {
      const url = "/api/Quote/QuoteFreightChargeResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteQuotation(QuoteID) {
    try {
      const url = "/api/Quote/QuoteResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}`;
      const response = await API.delete(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getFreightChargeSettingResult(QuoteID, PID) {
    try {
      const url = "/api/Quote/QuoteFreightColumnSettingResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getFreightChargeResult(QuoteID, PID) {
    try {
      const url = "/api/Quote/QuoteFreightChargeResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getLocalChargeResult(QuoteID, PID, IsExport, location) {
    try {
      const url = "/api/Quote/QuoteLocalChargegResult";
      const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}&IsExport=${IsExport}&location=${location}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteDetailService();
