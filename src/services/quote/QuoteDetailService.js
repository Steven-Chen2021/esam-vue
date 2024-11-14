import API from "../interceptor";

class QuoteDetailService {
  async getQuoteDetailResult(QID, PL, HQID) {
    try {
      const url = "/api/Quote/QuoteDetailResult";
      let fullUrl = `${url}?QuoteID=${QID}`;
      if (PL) {
        fullUrl = `${fullUrl}&PID=${PL}`;
      }
      if (HQID) {
        fullUrl = `${fullUrl}&CustomerHQID=${HQID}`;
      }
      const response = await API.get(fullUrl);
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

  async getTradeTerm() {
    try {
      const url = "/api/Quote/TradeTermResult";
      const response = await API.get(url);
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

  // async getFreightChargeResult(QuoteID, PID) {
  //   try {
  //     const url = "/api/Quote/QuoteFreightChargeResult";
  //     const fullUrl = `${url}?QuoteID=${QuoteID}&PID=${PID}`;
  //     const response = await API.get(fullUrl);
  //     return response;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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

  async saveQuoteDetail(params) {
    try {
      const url = "/api/Quote/QuoteDetailResult";
      const response = await API.post(url, params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async saveFreightCharge(params) {
    try {
      const url = "/api/Quote/QuoteFreightChargeResult";
      const response = await API.post(url, params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async saveLocalCharge(params) {
    try {
      const url = "/api/Quote/QuoteLocalChargeResult";
      const response = await API.post(url, params);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
  async getQuoteLCPResult(PLCode, IsExport, cityID) {
    try {
      const url = "/api/Quote/QuoteLCPList";
      const fullUrl = `${url}?productLineCode=${PLCode}&IsExport=${IsExport}&cityID=${cityID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  async getQuoteLCPDetailResult(PID, IsExport, LCPID) {
    try {
      const url = "/api/Quote/QuoteLCPDetailResult";
      const fullUrl = `${url}?PID=${PID}&IsExport=${IsExport}&LCPID=${LCPID}`;
      const response = await API.get(fullUrl);
      return response;
    } catch (error) {
      console.error(error);
    }
  }
}

export default new QuoteDetailService();
